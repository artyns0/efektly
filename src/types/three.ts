/* ------------------------------------------------------------------ */
/*  3D workspace types — real-time generative 3D, separate from Shader. */
/* ------------------------------------------------------------------ */

export type ThreeToolId = "particleForms3D" | "elasticBubble3D";

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

export interface ElasticBubble3DSettings {
  /* shape / form */
  size: number; // 0–100
  stretchX: number; // 0–200 (%)
  stretchY: number;
  stretchZ: number;
  roundness: number; // 0–100 (100 = keeps sphere, low = more deformed)
  surfaceSmoothness: number; // 0–100 → mesh subdivision
  /* soft body / elasticity */
  elasticity: number; // 0–100
  softness: number; // 0–100
  wobble: number; // 0–100
  damping: number; // 0–100
  recovery: number; // 0–100
  blobStrength: number; // 0–100
  /* motion */
  speed: number; // 0–3
  turbulence: number; // 0–100
  noiseScale: number; // 0–100
  flow: number; // 0–100
  drift: number; // 0–100
  loopDuration: number; // seconds
  autoMotion: boolean;
  /* wind */
  windStrength: number; // 0–100
  windX: number; // -100..100
  windY: number;
  windZ: number;
  gust: number; // 0–100
  /* surface / material */
  gloss: number; // 0–100
  reflectivity: number; // 0–100
  refraction: number; // 0–100
  fresnel: number; // 0–100
  chromatic: number; // 0–100 iridescence
  rimLight: number; // 0–100
  opacity: number; // 0–100
  /* color */
  baseColor: string;
  highlightColor: string;
  shadowTint: string;
  colorShift: number; // 0–100
  emissiveTint: string;
  background: string;
  /* rotation / scene */
  rotateX: number; // deg
  rotateY: number;
  rotateZ: number;
  autoRotate: boolean;
  lightIntensity: number; // 0–100
  lightX: number; // -100..100
  lightY: number;
  lightZ: number;
  cameraDistance: number; // 0–100
}
