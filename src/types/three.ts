/* ------------------------------------------------------------------ */
/*  3D workspace types — real-time generative 3D, separate from Shader. */
/* ------------------------------------------------------------------ */

export type ThreeToolId = "particleForms3D";

export type ParticleShape =
  | "sphere"
  | "cube"
  | "torus"
  | "cylinder"
  | "prism";

export interface ParticleForms3DSettings {
  shape: ParticleShape;
  /* particles */
  particleCount: number; // 500–30000
  particleSize: number; // 0–100
  opacity: number; // 0–100
  glow: number; // 0–100
  softness: number; // 0–100
  /* motion */
  speed: number; // 0–3
  turbulence: number; // 0–100
  flowStrength: number; // 0–100
  drift: number; // 0–100
  loopDuration: number; // seconds
  /* form / depth */
  shapeScale: number; // 0–100
  depth: number; // 0–100 (z-scale)
  perspective: number; // 0–100 (camera fov)
  thickness: number; // 0–100 (surface → filled volume)
  surfaceSpread: number; // 0–100 (positional jitter)
  /* rotation */
  rotateX: number; // degrees
  rotateY: number; // degrees
  rotateZ: number; // degrees
  autoRotate: boolean;
  /* colors */
  colorA: string;
  colorB: string;
  gradientMix: number; // 0–100
  background: string;
}
