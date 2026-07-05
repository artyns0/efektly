import * as THREE from "three";
import type {
  ParticleForms3DSettings,
  ParticleShape,
} from "../../types/three";

/* ------------------------------------------------------------------ */
/*  Particle Forms 3D — a THREE.Points cloud whose particles form the   */
/*  surface/volume of a primitive shape and flow with looping           */
/*  turbulence. Pure Three logic; the React viewport drives it.        */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function hexColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/** Soft round sprite for glowing, feathered particles. */
function makeSprite(softness: number): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  const core = 0.05 + (1 - softness / 100) * 0.35; // harder core when less soft
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(core, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/** A base position on/in the chosen shape (unit-ish scale, ~1.4 radius). */
function shapePoint(shape: ParticleShape, thickness: number, out: THREE.Vector3) {
  const fill = thickness / 100; // 0 = thin surface, 1 = filled volume
  const rnd = () => Math.random() * 2 - 1;
  switch (shape) {
    case "cube": {
      const x = rnd(), y = rnd(), z = rnd();
      // push the dominant axis to the face for a surface shell
      if (Math.random() > fill) {
        const ax = Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) || 1;
        out.set(x / ax, y / ax, z / ax);
      } else out.set(x, y, z);
      out.multiplyScalar(1.2);
      return;
    }
    case "torus": {
      const R = 1.0, r = 0.42 * (0.4 + 0.6 * (Math.random() < fill ? Math.random() : 1));
      const u = Math.random() * TAU;
      const v = Math.random() * TAU;
      out.set(
        (R + r * Math.cos(v)) * Math.cos(u),
        (R + r * Math.cos(v)) * Math.sin(u),
        r * Math.sin(v),
      );
      out.multiplyScalar(1.15);
      return;
    }
    case "cylinder": {
      const rad = 0.9 * (Math.random() < fill ? Math.sqrt(Math.random()) : 1);
      const a = Math.random() * TAU;
      out.set(rad * Math.cos(a), rnd() * 1.25, rad * Math.sin(a));
      return;
    }
    case "prism": {
      // triangular cross-section extruded along z
      let bx = Math.random(), by = Math.random();
      if (bx + by > 1) { bx = 1 - bx; by = 1 - by; }
      const tri = [
        [0, 1.2],
        [-1.05, -0.7],
        [1.05, -0.7],
      ];
      let px = tri[0][0] * (1 - bx - by) + tri[1][0] * bx + tri[2][0] * by;
      let py = tri[0][1] * (1 - bx - by) + tri[1][1] * bx + tri[2][1] * by;
      if (Math.random() > fill) {
        // bias toward edges for a shell look
        px *= 1.02; py *= 1.02;
      }
      out.set(px, py, rnd() * 1.2);
      return;
    }
    case "sphere":
    default: {
      // random direction (gaussian-ish) → normalize
      let x = rnd(), y = rnd(), z = rnd();
      const len = Math.hypot(x, y, z) || 1;
      x /= len; y /= len; z /= len;
      const rad = Math.random() < fill ? Math.cbrt(Math.random()) : 1;
      out.set(x, y, z).multiplyScalar(1.25 * rad);
      return;
    }
  }
}

export class ParticleForms {
  readonly points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private sprite: THREE.Texture;

  private base = new Float32Array(0); // undisturbed positions
  private seed = new Float32Array(0); // per-particle phase
  private grad = new Float32Array(0); // per-particle 0..1 gradient key
  private count = 0;

  // change-detection signatures
  private sigGeo = "";
  private sigColor = "";
  private sigSoft = -1;

  constructor() {
    this.sprite = makeSprite(50);
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

  /** Rebuild geometry / colors / material when the relevant settings change. */
  sync(s: ParticleForms3DSettings): void {
    const geoSig = [
      s.shape,
      Math.round(s.particleCount),
      Math.round(s.thickness),
      Math.round(s.surfaceSpread),
    ].join("|");
    if (geoSig !== this.sigGeo) {
      this.sigGeo = geoSig;
      this.rebuild(s);
      this.sigColor = ""; // force recolor after rebuild
    }

    const colorSig = [s.colorA, s.colorB, Math.round(s.gradientMix)].join("|");
    if (colorSig !== this.sigColor) {
      this.sigColor = colorSig;
      this.recolor(s);
    }

    if (Math.round(s.softness) !== this.sigSoft) {
      this.sigSoft = Math.round(s.softness);
      this.sprite.dispose();
      this.sprite = makeSprite(s.softness);
      this.material.map = this.sprite;
      this.material.needsUpdate = true;
    }

    // Cheap per-frame material props.
    this.material.size = 0.012 + (s.particleSize / 100) * 0.09;
    this.material.opacity = s.opacity / 100;
  }

  private rebuild(s: ParticleForms3DSettings): void {
    const n = Math.max(100, Math.min(30000, Math.round(s.particleCount)));
    this.count = n;
    this.base = new Float32Array(n * 3);
    this.seed = new Float32Array(n);
    this.grad = new Float32Array(n);
    const spread = (s.surfaceSpread / 100) * 0.18;
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      shapePoint(s.shape, s.thickness, v);
      v.x += (Math.random() * 2 - 1) * spread;
      v.y += (Math.random() * 2 - 1) * spread;
      v.z += (Math.random() * 2 - 1) * spread;
      this.base[i * 3] = v.x;
      this.base[i * 3 + 1] = v.y;
      this.base[i * 3 + 2] = v.z;
      this.seed[i] = Math.random();
      this.grad[i] = (v.y + 1.4) / 2.8; // vertical key 0..1
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

  private recolor(s: ParticleForms3DSettings): void {
    const a = hexColor(s.colorA);
    const b = hexColor(s.colorB);
    const mix = s.gradientMix / 100;
    const col = this.geometry.getAttribute("color") as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    const tmp = new THREE.Color();
    for (let i = 0; i < this.count; i++) {
      const k = Math.min(1, Math.max(0, this.grad[i] * (0.5 + mix) + (mix - 0.5) * 0.3));
      tmp.copy(a).lerp(b, k);
      arr[i * 3] = tmp.r;
      arr[i * 3 + 1] = tmp.g;
      arr[i * 3 + 2] = tmp.b;
    }
    col.needsUpdate = true;
  }

  /** Per-frame update: looping turbulence + rotation. */
  tick(time: number, dt: number, s: ParticleForms3DSettings): void {
    const pos = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const loop = Math.max(0.5, s.loopDuration);
    const w = TAU / loop; // seamless loop frequency
    const t = time * s.speed;
    const amp = (s.turbulence / 100) * 0.4;
    const freq = 0.6 + (s.flowStrength / 100) * 2.4;
    const driftAmp = (s.drift / 100) * 0.25;

    for (let i = 0; i < this.count; i++) {
      const j = i * 3;
      const bx = this.base[j];
      const by = this.base[j + 1];
      const bz = this.base[j + 2];
      const ph = this.seed[i] * TAU;
      arr[j] = bx + Math.sin(w * t + ph + bx * freq) * amp
        + Math.sin(w * t * 0.5) * driftAmp;
      arr[j + 1] = by + Math.cos(w * t * 1.1 + ph + by * freq) * amp;
      arr[j + 2] = bz + Math.sin(w * t * 0.9 + ph * 1.3 + bz * freq) * amp
        + Math.cos(w * t * 0.4) * driftAmp;
    }
    pos.needsUpdate = true;

    const objScale = 0.6 + (s.shapeScale / 100) * 1.6;
    this.points.scale.set(objScale, objScale, objScale * (0.4 + (s.depth / 100) * 1.4));

    this.points.rotation.x = s.rotateX * DEG;
    this.points.rotation.z = s.rotateZ * DEG;
    this.points.rotation.y = s.autoRotate
      ? this.points.rotation.y + dt * s.speed * 0.3
      : s.rotateY * DEG;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.sprite.dispose();
  }
}
