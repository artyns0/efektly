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
  | "kineticLines";

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
  count: number;
  sparkSize: number;
  spread: number;
  gravity: number;
  glow: number;
  decay: number;
  speed: number;
  burstStrength: number;
  trailLength: number;
  mouseFollow: boolean;
  autoBurst: boolean;
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
    KineticLinesSettings
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
