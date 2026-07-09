import * as THREE from "three";
import type { ImageParticles3DSettings } from "../../types/three";
import { makeSoftSprite } from "./threeUtils";

/* ------------------------------------------------------------------ */
/*  Image to 3D Particles — reconstructs an uploaded image as a 3D      */
/*  particle cloud. Per-pixel depth is derived heuristically from       */
/*  luminance + local edge/contrast + silhouette so the result has real */
/*  front/back separation (not a flat plane). GPU point shader gives     */
/*  per-particle size + soft sprites.                                   */
/* ------------------------------------------------------------------ */

const MAX_PARTICLES = 60000;

const VERT = /* glsl */ `
  attribute float aSize;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uSprite;
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    vec4 t = texture2D(uSprite, gl_PointCoord);
    if (t.a < 0.02) discard;
    gl_FragColor = vec4(vColor, t.a * uOpacity);
  }
`;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export class ImageParticles {
  readonly points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private sprite: THREE.Texture;
  private sampler: HTMLCanvasElement;

  private sig = "";
  private count = 0;

  constructor() {
    this.sprite = makeSoftSprite(55);
    this.sampler = document.createElement("canvas");
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uSprite: { value: this.sprite },
        uOpacity: { value: 1 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
    });
    this.points = new THREE.Points(this.geometry, this.material);
  }

  hasImage(): boolean {
    return this.count > 0;
  }

  sync(s: ImageParticles3DSettings, image: HTMLImageElement | null): void {
    const key = image
      ? [
          image.src.slice(-40),
          Math.round(s.particleDensity), Math.round(s.depthStrength),
          Math.round(s.zSpread), Math.round(s.edgeSensitivity),
          Math.round(s.brightnessInfluence), Math.round(s.contrastInfluence),
          Math.round(s.threshold), Math.round(s.silhouetteStrength),
          Math.round(s.smoothness), s.colorMode, s.colorA, s.colorB,
        ].join("|")
      : "none";
    if (key !== this.sig) {
      this.sig = key;
      if (image && image.naturalWidth > 0) this.rebuild(s, image);
      else this.clear();
    }
    this.material.uniforms.uOpacity.value =
      (s.opacity / 100) * (0.6 + (s.glow / 100) * 0.8);
    (this.material.blending as THREE.Blending) =
      s.glow > 55 ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.material.needsUpdate = true;
  }

  private clear(): void {
    this.count = 0;
    this.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(0), 3));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(0), 1));
  }

  private rebuild(s: ImageParticles3DSettings, image: HTMLImageElement): void {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const aspect = iw / ih;

    // Grid resolution from density, capped to the particle budget.
    let gw = Math.round(50 + (s.particleDensity / 100) * 230);
    let gh = Math.round(gw / aspect);
    while (gw * gh > MAX_PARTICLES) { gw = Math.round(gw * 0.92); gh = Math.round(gw / aspect); }

    const cv = this.sampler;
    cv.width = gw;
    cv.height = gh;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    // Optional smoothing: draw slightly blurred for softer depth.
    cx.filter = s.smoothness > 0 ? `blur(${(s.smoothness / 100) * 1.2}px)` : "none";
    cx.clearRect(0, 0, gw, gh);
    cx.drawImage(image, 0, 0, gw, gh);
    cx.filter = "none";
    const data = cx.getImageData(0, 0, gw, gh).data;

    const lumOf = (i: number) =>
      (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;

    // Mean luminance for contrast reference.
    let mean = 0;
    const px = gw * gh;
    for (let i = 0; i < px; i++) mean += lumOf(i * 4);
    mean /= px;

    const thr = s.threshold / 100;
    const depthK = (s.depthStrength / 100) * (0.4 + (s.zSpread / 100) * 1.6);
    const brightK = s.brightnessInfluence / 100;
    const edgeK = (s.edgeSensitivity / 100) * 3;
    const contrastK = s.contrastInfluence / 100;
    const silK = s.silhouetteStrength / 100;

    const colA = new THREE.Color(s.colorA);
    const colB = new THREE.Color(s.colorB);
    const tmp = new THREE.Color();

    // View size: fit the longer edge to ~3 world units.
    const worldW = aspect >= 1 ? 3 : 3 * aspect;
    const worldH = worldW / aspect;

    const posArr: number[] = [];
    const colArr: number[] = [];
    const sizeArr: number[] = [];

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const idx = (y * gw + x) * 4;
        const alpha = data[idx + 3] / 255;
        const lum = lumOf(idx);
        // Local edge (right + down neighbours).
        const lr = x < gw - 1 ? lumOf(idx + 4) : lum;
        const ld = y < gh - 1 ? lumOf(idx + gw * 4) : lum;
        const edge = Math.abs(lum - lr) + Math.abs(lum - ld);

        // Silhouette / background rejection.
        const importance = Math.max(lum - thr, edge * 1.5);
        if (alpha < 0.15 || importance <= 0.001) continue;

        const u = x / (gw - 1);
        const v = y / (gh - 1);
        const wx = (u - 0.5) * worldW;
        const wy = (0.5 - v) * worldH;
        // Depth: bright/contrast pushes forward, edges add relief.
        let wz =
          ((lum - 0.5) * brightK +
            (lum - mean) * contrastK +
            edge * edgeK +
            edge * silK) * depthK;
        // Small per-particle jitter for volume (not a flat sheet).
        wz += (Math.random() - 0.5) * depthK * 0.12;

        posArr.push(wx, wy, wz);

        if (s.colorMode === "monochrome") {
          tmp.copy(colA).multiplyScalar(0.35 + lum * 0.9);
        } else if (s.colorMode === "duotone") {
          tmp.copy(colA).lerp(colB, clamp(lum, 0, 1));
        } else {
          tmp.setRGB(data[idx] / 255, data[idx + 1] / 255, data[idx + 2] / 255);
        }
        colArr.push(tmp.r, tmp.g, tmp.b);

        // Per-particle size: brighter / more important = larger.
        const size =
          (0.6 + importance * 1.4) * (0.5 + brightK * lum) *
          (0.02 + (s.pointSize / 100) * 0.08) * 60;
        sizeArr.push(size);
      }
    }

    this.count = sizeArr.length;
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colArr, 3));
    this.geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizeArr, 1));
    this.geometry.computeBoundingSphere();
  }

  tick(time: number, dt: number, s: ImageParticles3DSettings): void {
    if (s.autoRotate) this.points.rotation.y += dt * 0.2;
    // Subtle parallax nod so depth reads even when idle.
    if (s.parallaxStrength > 0) {
      const p = (s.parallaxStrength / 100) * 0.12;
      this.points.rotation.x = Math.sin(time * 0.4) * p;
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.sprite.dispose();
  }
}
