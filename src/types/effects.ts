/* ------------------------------------------------------------------ */
/*  Efektly Effect Stack — category model.                             */
/*  UI/state architecture only: these describe the five effect         */
/*  categories and their settings. No canvas processing is wired to    */
/*  them yet — that is reconnected in a later step.                    */
/* ------------------------------------------------------------------ */

export type EffectType =
  | "dither"
  | "ascii"
  | "glitch"
  | "lineArt"
  | "grain"
  | "reflectionGrid"
  | "verticalEcho"
  | "crosshatch"
  | "scanStretch"
  | "pixelSort"
  | "lightTrails"
  | "crtMonitor"
  | "vhsBleed"
  | "kaleidoscope"
  | "neonEdge"
  | "visionTracker";

/** Drives the small status chip shown on each stack item. */
export type EffectStatus = "ui-ready" | "controls-ready" | "coming-next";

/** Shared tint mode used by several effects. */
export type ColorMode = "mono" | "original" | "brand";

/* ----- Dither ----- */

export type DitherPreset =
  | "floyd-steinberg"
  | "ordered"
  | "bayer"
  | "atkinson";

/** Whether an effect recolors to its palette or keeps the source's colors. */
export type EffectColorMode = "custom" | "original";

export interface DitherSettings {
  preset: DitherPreset;
  colorMode: EffectColorMode;
  pointSize: number;
  threshold: number;
  contrast: number;
  palette: string[];
  invert: boolean;
  bloom: boolean;
  bloomIntensity: number; // 0–100
  bloomRadius: number; // px
  bloomThreshold: number; // 0–100
}

/* ----- ASCII ----- */

export type AsciiPreset = "standard" | "dense" | "minimal" | "blocks";
export type AsciiCharSet = "standard" | "dense" | "minimal" | "blocks";

export interface AsciiSettings {
  preset: AsciiPreset;
  cellSize: number;
  charSet: AsciiCharSet;
  invert: boolean;
  colorMode: ColorMode;
  rotation: boolean;
  fgColor: string;
  bgColor: string;
}

/* ----- Glitch ----- */

export type GlitchPreset = "vhs" | "digital" | "rgb-split" | "signal-break";

export interface GlitchSettings {
  preset: GlitchPreset;
  rgbShift: number;
  scanlines: number;
  distortion: number;
  noise: number;
  glitches: number;
  grain: number;
  animation: boolean;
}

/* ----- Line Art ----- */

export type LineArtPreset = "clean" | "sketch" | "ink" | "technical";

export interface LineArtSettings {
  preset: LineArtPreset;
  threshold: number;
  thickness: number;
  softness: number;
  fill: number;
  lineWeight: number;
  wave: number;
  waveFrequency: number;
  invert: boolean;
  lineColor: string;
  fillColor: string;
  bgColor: string;
}

/* ----- Grain ----- */

export type GrainBlend = "normal" | "overlay" | "soft-light" | "screen";

export interface GrainSettings {
  amount: number;
  size: number;
  speed: number;
  monochrome: boolean;
  blendMode: GrainBlend;
}

/* ----- Reflection Grid ----- */

export type ReflectionGridPreset =
  | "soft-mirror"
  | "radial-tile"
  | "tunnel-grid"
  | "kaleido"
  | "dark-glow";

export interface ReflectionGridSettings {
  preset: ReflectionGridPreset;
  cellSize: number; // 0–100, sample region size
  repeatCount: number; // grid cells per axis
  mirrorAmount: number; // 0–100, mirror blend
  rotation: number; // degrees
  scale: number; // 0.25–4 sample zoom
  softness: number; // 0–100 blur
  glow: number; // 0–100 bloom
  contrast: number; // -100–100
  colorShift: number; // 0–360 hue rotate
  noise: number; // 0–100
  centerX: number; // 0–1 sample center
  centerY: number; // 0–1
  invert: boolean;
  colorMode: ColorMode;
}

/* ----- Vertical Echo ----- */

export type VerticalEchoPreset =
  | "clean-echo"
  | "long-streak"
  | "ghost-fade"
  | "high-contrast"
  | "soft-scan";

export type EchoDirection = "up" | "down" | "both";

export interface VerticalEchoSettings {
  preset: VerticalEchoPreset;
  direction: EchoDirection;
  echoLength: number; // 0–100, trail distance
  repeatCount: number; // ghost layers
  opacityFade: number; // 0–100, fade per layer
  stretchAmount: number; // 0–100, vertical stretch
  blur: number; // 0–100
  threshold: number; // 0–100, luminance keying
  contrast: number; // -100–100
  noise: number; // 0–100
  offsetJitter: number; // 0–100, horizontal jitter
  backgroundFade: number; // 0–100, background wash
  invert: boolean;
  colorMode: ColorMode;
  fgColor: string;
  bgColor: string;
  accentColor: string;
}

/* ----- Effect pack v2 (schema-driven controls) ----- */

export type Axis = "horizontal" | "vertical";

export interface CrosshatchSettings {
  preset: string;
  lineDensity: number;
  lineWidth: number;
  angle1: number;
  angle2: number;
  threshold: number;
  contrast: number;
  roughness: number;
  jitter: number;
  inkColor: string;
  bgColor: string;
  invert: boolean;
}

export interface ScanStretchSettings {
  direction: Axis;
  scanWidth: number;
  stretchAmount: number;
  density: number;
  fade: number;
  jitter: number;
  threshold: number;
  contrast: number;
  colorMode: ColorMode;
  invert: boolean;
}

export interface PixelSortSettings {
  direction: Axis;
  threshold: number;
  sortLength: number;
  chaos: number;
  maskStrength: number;
  colorPreserve: number;
  blend: number;
  invert: boolean;
}

export interface LightTrailsSettings {
  angle: number;
  trailLength: number;
  threshold: number;
  glow: number;
  decay: number;
  blur: number;
  intensity: number;
  color: string;
  blendMode: "screen" | "add" | "soft-light";
}

export interface CrtMonitorSettings {
  curvature: number;
  scanlines: number;
  rgbMask: number;
  phosphorGlow: number;
  flicker: number;
  noise: number;
  vignette: number;
  brightness: number;
  contrast: number;
}

export interface VhsBleedSettings {
  colorBleed: number;
  horizontalSmear: number;
  trackingNoise: number;
  scanlines: number;
  jitter: number;
  distortion: number;
  noise: number;
  saturation: number;
  timeDrift: number;
}

export interface KaleidoscopeSettings {
  segments: number;
  rotation: number;
  scale: number;
  mirrorAmount: number;
  centerX: number;
  centerY: number;
  softness: number;
  glow: number;
  colorShift: number;
  background: string;
}

export interface NeonEdgeSettings {
  preset: string;
  sensitivity: number; // 0–100, edge amount (higher = more edges)
  thickness: number; // 0–100, edge dilation
  glow: number; // 0–100
  brightness: number; // 0–100
  color: string;
  background: "black" | "original";
}

/* ----- Vision Tracker ----- */

export type VisionShapeMode =
  | "boxes"
  | "lines"
  | "boxesLines"
  | "dots"
  | "crosshair"
  | "cube"
  | "hud"
  | "network"
  | "dataLabels";

export type VisionBackground =
  | "original"
  | "grayscale"
  | "threshold"
  | "black"
  | "difference";

export type ProcessingScale = "low" | "medium" | "high";

export interface VisionTrackerSettings {
  /* detection */
  threshold: number; // 0–100
  blur: number; // 0–100
  contrast: number; // 0–100
  minArea: number; // 0–100
  maxArea: number; // 0–100
  mergeDistance: number; // 0–100
  sensitivity: number; // 0–100
  invert: boolean;
  backgroundDiff: boolean;
  motionDiff: boolean;
  processingScale: ProcessingScale;
  /* tracking */
  maxBlobs: number; // 1–120
  matchDistance: number; // 0–100
  persistence: number; // 0–100 (frames kept when missing)
  smoothing: number; // 0–100
  idStability: number; // 0–100
  velocitySmoothing: number; // 0–100
  /* overlay */
  shapeMode: VisionShapeMode;
  showBoxes: boolean;
  showCenters: boolean;
  showIds: boolean;
  showArea: boolean;
  showLines: boolean;
  showTrails: boolean;
  showNetwork: boolean;
  lineDistance: number; // 0–100
  trailLength: number; // 0–100
  /* style */
  boxColor: string;
  lineColor: string;
  centerColor: string;
  textColor: string;
  boxThickness: number; // 0–100
  lineThickness: number; // 0–100
  textSize: number; // 0–100
  opacity: number; // 0–100
  glow: number; // 0–100
  /* background */
  background: VisionBackground;
}

/* ----- Instance model ----- */

export interface EffectSettingsMap {
  dither: DitherSettings;
  ascii: AsciiSettings;
  glitch: GlitchSettings;
  lineArt: LineArtSettings;
  grain: GrainSettings;
  reflectionGrid: ReflectionGridSettings;
  verticalEcho: VerticalEchoSettings;
  crosshatch: CrosshatchSettings;
  scanStretch: ScanStretchSettings;
  pixelSort: PixelSortSettings;
  lightTrails: LightTrailsSettings;
  crtMonitor: CrtMonitorSettings;
  vhsBleed: VhsBleedSettings;
  kaleidoscope: KaleidoscopeSettings;
  neonEdge: NeonEdgeSettings;
  visionTracker: VisionTrackerSettings;
}

/** A patch carries a partial of exactly one effect's settings. */
export type EffectSettingsPatch =
  | Partial<DitherSettings>
  | Partial<AsciiSettings>
  | Partial<GlitchSettings>
  | Partial<LineArtSettings>
  | Partial<GrainSettings>
  | Partial<ReflectionGridSettings>
  | Partial<VerticalEchoSettings>
  | Partial<CrosshatchSettings>
  | Partial<ScanStretchSettings>
  | Partial<PixelSortSettings>
  | Partial<LightTrailsSettings>
  | Partial<CrtMonitorSettings>
  | Partial<VhsBleedSettings>
  | Partial<KaleidoscopeSettings>
  | Partial<NeonEdgeSettings>
  | Partial<VisionTrackerSettings>;

interface EffectBase<T extends EffectType> {
  id: string;
  type: T;
  name: string;
  enabled: boolean;
  status: EffectStatus;
  settings: EffectSettingsMap[T];
}

/** Discriminated union so `settings` narrows by `type`. */
export type EffectInstance =
  | EffectBase<"dither">
  | EffectBase<"ascii">
  | EffectBase<"glitch">
  | EffectBase<"lineArt">
  | EffectBase<"grain">
  | EffectBase<"reflectionGrid">
  | EffectBase<"verticalEcho">
  | EffectBase<"crosshatch">
  | EffectBase<"scanStretch">
  | EffectBase<"pixelSort">
  | EffectBase<"lightTrails">
  | EffectBase<"crtMonitor">
  | EffectBase<"vhsBleed">
  | EffectBase<"kaleidoscope">
  | EffectBase<"neonEdge">
  | EffectBase<"visionTracker">;
