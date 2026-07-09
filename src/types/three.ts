/* ------------------------------------------------------------------ */
/*  3D workspace types — real-time generative 3D, separate from Shader. */
/* ------------------------------------------------------------------ */

export type ThreeToolId =
  | "particleForms3D"
  | "elasticBubble3D"
  | "interactiveParticles3D"
  | "imageParticles3D";

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

/* ----- Particle Form 3D (mouse-interactive) ----- */

export type InteractiveShape = "sphere" | "shell" | "blob" | "cloud" | "field";
export type InteractiveColorMode = "gradient" | "solid" | "chromatic";
export type MouseMode = "repel" | "attract" | "disturb";

export interface InteractiveParticles3DSettings {
  preset: string;
  shape: InteractiveShape;
  /* particles */
  particleCount: number; // 1000–24000
  pointSize: number; // 0–100
  opacity: number; // 0–100
  glow: number; // 0–100
  softness: number; // 0–100
  /* motion */
  speed: number; // 0–3
  turbulence: number; // 0–100
  noiseAmount: number; // 0–100
  morph: number; // 0–100
  loopSpeed: number; // 0–3
  /* interaction */
  interactionRadius: number; // 0–100
  interactionStrength: number; // 0–100
  mouseMode: MouseMode;
  smoothing: number; // 0–100 (interpolation)
  /* color */
  colorMode: InteractiveColorMode;
  colorA: string;
  colorB: string;
  background: string;
  /* rotation */
  autoRotate: boolean;
}

/* ----- Image to 3D Particles ----- */

export type ImageColorMode = "original" | "monochrome" | "duotone";

export interface ImageParticles3DSettings {
  preset: string;
  /* reconstruction */
  depthStrength: number; // 0–100
  particleDensity: number; // 0–100
  pointSize: number; // 0–100
  brightnessInfluence: number; // 0–100
  edgeSensitivity: number; // 0–100
  zSpread: number; // 0–100
  smoothness: number; // 0–100
  contrastInfluence: number; // 0–100
  threshold: number; // 0–100 (drop dark background)
  silhouetteStrength: number; // 0–100
  /* color */
  colorMode: ImageColorMode;
  colorA: string;
  colorB: string;
  glow: number; // 0–100
  opacity: number; // 0–100
  background: string;
  /* scene */
  rotationSensitivity: number; // 0–100
  autoRotate: boolean;
  parallaxStrength: number; // 0–100
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
