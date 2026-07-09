import * as THREE from "three";
import type {
  InteractiveParticles3DSettings,
  InteractiveShape,
} from "../../types/three";
import { makeSoftSprite, snoise3 } from "./threeUtils";

/* ------------------------------------------------------------------ */
/*  Particle Form 3D — a THREE.Points cloud that forms a shape/volume  */
/*  and reacts to the mouse pointer in real time (repel / attract /     */
/*  disturb) with smooth per-particle interpolation, on top of looping  */
/*  turbulence + morph. GPU-rendered additive soft sprites.            */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

/** Base position for a particle on/in the chosen form (radius ~1.3). */
function shapePoint(shape: InteractiveShape, out: THREE.Vector3) {
  const rnd = () => Math.random() * 2 - 1;
  let x = rnd(), y = rnd(), z = rnd();
  const len = Math.hypot(x, y, z) || 1;
  x /= len; y /= len; z /= len;
  switch (shape) {
    case "shell": // thin hollow sphere
      out.set(x, y, z).multiplyScalar(1.3 * (0.96 + Math.random() * 0.04));
      return;
    case "blob": // filled volume
      out.set(x, y, z).multiplyScalar(1.3 * Math.cbrt(Math.random()));
      return;
    case "cloud": // gaussian-ish soft cloud
      out.set(
        (Math.random() + Math.random() + Math.random() - 1.5) * 1.1,
        (Math.random() + Math.random() + Math.random() - 1.5) * 1.1,
        (Math.random() + Math.random() + Math.random() - 1.5) * 1.1,
      );
      return;
    case "field": {
      // flattened swirling field (disc-ish)
      const a = Math.random() * TAU;
      const r = Math.sqrt(Math.random()) * 1.5;
      out.set(Math.cos(a) * r, rnd() * 0.5, Math.sin(a) * r);
      return;
    }
    case "sphere":
    default: // dot sphere surface
      out.set(x, y, z).multiplyScalar(1.3);
      return;
  }
}

export class InteractiveParticles {
  readonly points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private sprite: THREE.Texture;

  private base = new Float32Array(0);
  private disp = new Float32Array(0); // smoothed interaction displacement
  private seed = new Float32Array(0);
  private grad = new Float32Array(0);
  private count = 0;

  private sigGeo = "";
  private sigColor = "";
  private sigSoft = -1;

  // Smoothed pointer state (object-local space).
  private pointer = new THREE.Vector3();
  private pointerTarget = new THREE.Vector3();
  private active = 0;
  private activeTarget = 0;

  constructor() {
    this.sprite = makeSoftSprite(60);
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.05,
      map: this.sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(this.geometry, this.material);
  }

  /** Feed a world-space pointer target (or null to fade interaction out). */
  setPointer(world: THREE.Vector3 | null): void {
    if (world) {
      // Convert to object-local space so it tracks rotation.
      this.points.updateMatrixWorld();
      this.pointerTarget.copy(world).applyMatrix4(
        this.points.matrixWorld.clone().invert(),
      );
      this.activeTarget = 1;
    } else {
      this.activeTarget = 0;
    }
  }

  sync(s: InteractiveParticles3DSettings): void {
    const geoSig = [s.shape, Math.round(s.particleCount)].join("|");
    if (geoSig !== this.sigGeo) {
      this.sigGeo = geoSig;
      this.rebuild(s);
      this.sigColor = "";
    }
    const colorSig = [s.colorMode, s.colorA, s.colorB].join("|");
    if (colorSig !== this.sigColor) {
      this.sigColor = colorSig;
      this.recolor(s);
    }
    if (Math.round(s.softness) !== this.sigSoft) {
      this.sigSoft = Math.round(s.softness);
      this.sprite.dispose();
      this.sprite = makeSoftSprite(s.softness);
      this.material.map = this.sprite;
      this.material.needsUpdate = true;
    }
    this.material.size = 0.01 + (s.pointSize / 100) * 0.08;
    this.material.opacity = (s.opacity / 100) * (0.5 + (s.glow / 100) * 0.9);
  }

  private rebuild(s: InteractiveParticles3DSettings): void {
    const n = Math.max(500, Math.min(24000, Math.round(s.particleCount)));
    this.count = n;
    this.base = new Float32Array(n * 3);
    this.disp = new Float32Array(n * 3);
    this.seed = new Float32Array(n);
    this.grad = new Float32Array(n);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      shapePoint(s.shape, v);
      this.base[i * 3] = v.x;
      this.base[i * 3 + 1] = v.y;
      this.base[i * 3 + 2] = v.z;
      this.seed[i] = Math.random();
      this.grad[i] = (v.y + 1.5) / 3;
    }
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.base), 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(n * 3), 3),
    );
  }

  private recolor(s: InteractiveParticles3DSettings): void {
    const a = new THREE.Color(s.colorA);
    const b = new THREE.Color(s.colorB);
    const col = this.geometry.getAttribute("color") as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    const tmp = new THREE.Color();
    for (let i = 0; i < this.count; i++) {
      if (s.colorMode === "solid") {
        arr[i * 3] = a.r; arr[i * 3 + 1] = a.g; arr[i * 3 + 2] = a.b;
      } else if (s.colorMode === "chromatic") {
        // spectral hue by height + seed → blue/purple/pink energy
        const hue = (0.55 + this.grad[i] * 0.35 + this.seed[i] * 0.15) % 1;
        tmp.setHSL(hue, 0.85, 0.62);
        arr[i * 3] = tmp.r; arr[i * 3 + 1] = tmp.g; arr[i * 3 + 2] = tmp.b;
      } else {
        tmp.copy(a).lerp(b, this.grad[i]);
        arr[i * 3] = tmp.r; arr[i * 3 + 1] = tmp.g; arr[i * 3 + 2] = tmp.b;
      }
    }
    col.needsUpdate = true;
  }

  tick(time: number, dt: number, s: InteractiveParticles3DSettings): void {
    const pos = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const t = time * s.loopSpeed;
    const amp = (s.turbulence / 100) * 0.35;
    const noise = (s.noiseAmount / 100) * 0.4;
    const morph = (s.morph / 100) * 0.5;
    const freq = 0.8 + (s.speed / 100) * 0; // base
    const w = TAU / 6; // gentle loop

    // Smooth pointer + activation toward targets.
    const sm = 0.06 + (1 - s.smoothing / 100) * 0.5; // higher smoothing = slower
    this.active += (this.activeTarget - this.active) * Math.min(1, sm * 2);
    this.pointer.lerp(this.pointerTarget, Math.min(1, sm));

    const radius = 0.15 + (s.interactionRadius / 100) * 1.1;
    const strength = (s.interactionStrength / 100) * 0.9 * this.active;
    const mode = s.mouseMode;
    const dispSmooth = Math.min(1, 0.08 + (1 - s.smoothing / 100) * 0.4);
    const px = this.pointer.x, py = this.pointer.y, pz = this.pointer.z;

    for (let i = 0; i < this.count; i++) {
      const j = i * 3;
      const bx = this.base[j];
      const by = this.base[j + 1];
      const bz = this.base[j + 2];
      const ph = this.seed[i] * TAU;

      // Looping turbulence + morph breathing.
      const nx = snoise3(bx * (1 + morph) + t, by, bz) * noise;
      let tx = bx + Math.sin(w * t + ph + bx) * amp + nx;
      let ty = by + Math.cos(w * t * 1.1 + ph + by) * amp + nx * 0.6;
      let tz = bz + Math.sin(w * t * 0.9 + ph * 1.3 + bz) * amp + nx * 0.8;

      // Mouse interaction — target displacement.
      let mdx = 0, mdy = 0, mdz = 0;
      if (strength > 0.001) {
        const dx = tx - px, dy = ty - py, dz = tz - pz;
        const d2 = dx * dx + dy * dy + dz * dz;
        const r2 = radius * radius;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1e-4;
          const fall = 1 - d / radius;
          const f = fall * fall * strength;
          if (mode === "attract") {
            mdx = -(dx / d) * f; mdy = -(dy / d) * f; mdz = -(dz / d) * f;
          } else if (mode === "disturb") {
            const s1 = snoise3(tx * 3 + t, ty * 3, tz * 3);
            const s2 = snoise3(ty * 3 - t, tz * 3, tx * 3);
            mdx = s1 * f; mdy = s2 * f; mdz = (s1 - s2) * 0.5 * f;
          } else {
            mdx = (dx / d) * f; mdy = (dy / d) * f; mdz = (dz / d) * f;
          }
        }
      }
      // Smooth the interaction displacement (spring-like, no snap).
      this.disp[j] += (mdx - this.disp[j]) * dispSmooth;
      this.disp[j + 1] += (mdy - this.disp[j + 1]) * dispSmooth;
      this.disp[j + 2] += (mdz - this.disp[j + 2]) * dispSmooth;

      arr[j] = tx + this.disp[j];
      arr[j + 1] = ty + this.disp[j + 1];
      arr[j + 2] = tz + this.disp[j + 2];
    }
    void freq;
    pos.needsUpdate = true;

    if (s.autoRotate) this.points.rotation.y += dt * s.speed * 0.25;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.sprite.dispose();
  }
}
