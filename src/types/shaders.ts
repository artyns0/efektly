/* ------------------------------------------------------------------ */
/*  Shader Mode types — procedural visuals, independent of media/effects.*/
/* ------------------------------------------------------------------ */

export type ShaderTypeId =
  | "dotGrid"
  | "meshLiquid"
  | "voronoi"
  | "particles"
  | "liquidGlass"
  | "liquidSilk"
  | "fluidLines"
  | "inkFlow"
  | "plasmaGradient"
  | "orbitParticles"
  | "kineticStripes"
  | "sparkBurst"
  | "kineticLines"
  | "auraOrb"
  | "holoyudu"
  | "nebulaDrift";

export type ShaderColorMode = "brand" | "mono" | "duo";

export type MotionStyle = "drift" | "pulse" | "wave" | "chaos";

/* ----- Per-shader parameter sets (each carries its own colors) ----- */

export interface DotGridSettings {
  dotSize: number; // 0–1 fraction of a cell
  spacing: number; // px between dot centers
  pulse: number; // 0–100 size pulsing
  drift: number; // 0–100 positional drift
  speed: number; // 0–3 time multiplier
  colorMode: ShaderColorMode;
  colorA: string; // dots
  colorB: string; // accent
  background: string;
}

export interface MeshLiquidSettings {
  scale: number; // 0–100
  distortion: number; // 0–100
  flow: number; // 0–100
  highlights: number; // 0–100
  smoothness: number; // 0–100
  speed: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface VoronoiSettings {
  cellCount: number; // number of seeds
  borderWidth: number; // 0–100
  distortion: number; // 0–100
  rotation: number; // degrees
  speed: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface ParticlesSettings {
  count: number; // particle count
  size: number; // 0–100
  spread: number; // 0–100
  glow: number; // 0–100
  speed: number;
  colorA: string;
  colorB: string;
  background: string;
}

/* ----- Shader pack v2 ----- */

export interface LiquidGlassSettings {
  scale: number;
  flowSpeed: number;
  distortion: number;
  smoothness: number;
  highlightIntensity: number;
  glassBlur: number;
  warpAmount: number;
  noise: number;
  colorA: string;
  colorB: string;
  accentColor: string;
  background: string;
}

export interface LiquidSilkSettings {
  scale: number;
  flow: number;
  distortion: number;
  highlight: number;
  smoothness: number;
  speed: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface FluidLinesSettings {
  lineCount: number;
  lineWidth: number;
  spacing: number;
  amplitude: number;
  frequency: number;
  flowSpeed: number;
  distortion: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface InkFlowSettings {
  spread: number;
  flowSpeed: number;
  diffusion: number;
  density: number;
  softness: number;
  noise: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface PlasmaGradientSettings {
  scale: number;
  speed: number;
  intensity: number;
  contrast: number;
  smoothness: number;
  colorA: string;
  colorB: string;
  colorC: string;
  background: string;
}

export interface OrbitParticlesSettings {
  count: number;
  radius: number;
  orbitSpeed: number;
  particleSize: number;
  glow: number;
  spread: number;
  centerX: number;
  centerY: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface KineticStripesSettings {
  stripeCount: number;
  stripeWidth: number;
  speed: number;
  angle: number;
  offset: number;
  softness: number;
  contrast: number;
  colorA: string;
  colorB: string;
  background: string;
}

export interface SparkBurstSettings {
  count: number; // max live particles
  emitRate: number; // 0–100 particles emitted per frame while moving
  sparkSize: number;
  spread: number;
  gravity: number;
  drag: number; // 0–100 velocity damping
  glow: number;
  decay: number;
  speed: number;
  burstStrength: number; // initial velocity magnitude
  trailLength: number;
  mouseFollow: boolean;
  autoBurst: boolean; // auto-emit from center when idle
  colorA: string;
  colorB: string;
  background: string;
}

/** Kinetic Lines — procedural seamless-loop line/dot patterns. `mode`
 *  selects the pattern family (set by presets). */
export type KineticLinesMode =
  | "orbit"
  | "waveSmear"
  | "contour"
  | "dotMatrix"
  | "spiral"
  | "radialMesh"
  | "pulseBlob"
  | "morphStar"
  | "particleGrid";

export interface KineticLinesSettings {
  mode: KineticLinesMode;
  lineCount: number;
  lineWidth: number;
  scale: number; // 0–100 overall size
  centerX: number; // 0–1 pattern center
  centerY: number; // 0–1 pattern center
  rotation: number; // degrees, static base rotation
  morph: number; // 0–100 shape morph amount
  noise: number; // 0–100 positional jitter
  glow: number; // 0–100 shadow blur
  opacity: number; // 0–100
  speed: number; // 0–3 local time multiplier
  loopDuration: number; // seconds per seamless loop
  colorA: string; // lines / dots
  colorB: string; // accent
  background: string;
  invert: boolean; // swap foreground / background
}

/** Aura Orb — a glowing procedural energy orb with inner flow + bloom. */
export interface AuraOrbSettings {
  /* orb / shape */
  radius: number; // 0–100
  edgeSoftness: number; // 0–100
  rimWidth: number; // 0–100
  roundness: number; // 0–100 (100 = perfect circle)
  centerX: number; // 0–1
  centerY: number; // 0–1
  /* glow / aura */
  glowIntensity: number; // 0–100
  glowRadius: number; // 0–100
  auraFalloff: number; // 0–100
  bloomAmount: number; // 0–100
  bloomRadius: number; // 0–100
  /* internal flow */
  flowSpeed: number; // 0–3
  flowScale: number; // 0–100
  flowDistortion: number; // 0–100
  innerBand: number; // 0–100
  plasma: number; // 0–100
  noise: number; // 0–100
  rotation: number; // degrees
  /* color */
  colorA: string;
  colorB: string;
  highlightColor: string;
  rimColor: string;
  background: string;
  colorShift: number; // 0–100
  /* motion */
  speed: number; // 0–3
  pulseAmount: number; // 0–100
  pulseSpeed: number; // 0–3
  loopDuration: number; // seconds
}

/** Holoyudu — procedural holographic / iridescent interference shader. */
export interface HoloyuduSettings {
  /* color */
  colorA: string;
  colorB: string;
  colorC: string;
  colorCount: number; // 1–3
  hueShift: number; // 0–100
  saturation: number; // 0–100
  blendAmount: number; // 0–100
  /* highlight */
  highlightStrength: number; // 0–100
  highlightAngle: number; // degrees
  highlightWidth: number; // 0–100
  highlightSoftness: number; // 0–100
  gloss: number; // 0–100
  /* flow */
  flowStrength: number; // 0–100
  flowAngle: number; // degrees
  flowDensity: number; // 0–100
  flowSpeed: number; // 0–3
  fluidMap: number; // 0–100
  distortion: number; // 0–100
  noise: number; // 0–100
  /* interference */
  interferenceScale: number; // 0–100
  bandDensity: number; // 0–100
  bandSoftness: number; // 0–100
  textureInfluence: number; // 0–100
  luminanceInfluence: number; // 0–100
  edgeInfluence: number; // 0–100
  /* output */
  opacity: number; // 0–100
  preserveDark: boolean;
  background: string;
}

/** Nebula Drift — soft volumetric pastel nebula (fbm cloud field). */
export interface NebulaDriftSettings {
  /* performance & raymarching */
  pixelRatio: number; // 0–100 (buffer scale)
  maxIterations: number; // 2–8 (fbm octaves)
  rayStepSize: number; // 0–100 (warp / detail)
  /* nebula */
  evolutionSpeed: number; // 0–3
  fogDensity: number; // 0–100
  fractalScale: number; // 0–100
  cloudRadius: number; // 0–100
  glowSoftness: number; // 0–100
  /* color phase */
  redPhase: number; // 0–100
  greenPhase: number; // 0–100
  bluePhase: number; // 0–100
  /* motion / loop */
  loop: boolean;
  loopSpeed: number; // 0–3
  driftStrength: number; // 0–100
  flowRotation: number; // degrees
  /* output */
  opacity: number; // 0–100
  colorA: string;
  colorB: string;
  background: string;
}

export interface ShaderSettingsMap {
  dotGrid: DotGridSettings;
  meshLiquid: MeshLiquidSettings;
  voronoi: VoronoiSettings;
  particles: ParticlesSettings;
  liquidGlass: LiquidGlassSettings;
  liquidSilk: LiquidSilkSettings;
  fluidLines: FluidLinesSettings;
  inkFlow: InkFlowSettings;
  plasmaGradient: PlasmaGradientSettings;
  orbitParticles: OrbitParticlesSettings;
  kineticStripes: KineticStripesSettings;
  sparkBurst: SparkBurstSettings;
  kineticLines: KineticLinesSettings;
  auraOrb: AuraOrbSettings;
  holoyudu: HoloyuduSettings;
  nebulaDrift: NebulaDriftSettings;
}

/** A partial of any one shader's settings (for updates + presets). */
export type ShaderSettingsPatch = Partial<
  DotGridSettings &
    MeshLiquidSettings &
    VoronoiSettings &
    ParticlesSettings &
    LiquidGlassSettings &
    LiquidSilkSettings &
    FluidLinesSettings &
    InkFlowSettings &
    PlasmaGradientSettings &
    OrbitParticlesSettings &
    KineticStripesSettings &
    SparkBurstSettings &
    KineticLinesSettings &
    AuraOrbSettings &
    HoloyuduSettings &
    NebulaDriftSettings
>;

export interface ShaderAnimation {
  animate: boolean;
  speed: number; // 0–3 global time multiplier
  loop: boolean;
  motionStyle: MotionStyle;
}

export interface ShaderPreset {
  name: string;
  settings: ShaderSettingsPatch;
}
