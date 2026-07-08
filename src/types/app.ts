/* ------------------------------------------------------------------ */
/*  Core domain types                                                  */
/* ------------------------------------------------------------------ */

/** Which left-panel view is showing. Driven by the side nav + Export CTA. */
export type AppMode = "media" | "shader" | "export" | "settings" | "three";

/**
 * Playground-layout rail section (Phase 3+). Selects the left panel content
 * in the new shell; the classic shell ignores it. "animate" | "text" |
 * "shapes" | "audio" | "presets" are future stubs.
 */
export type RailSection =
  | "source"
  | "effects"
  | "animate"
  | "text"
  | "shapes"
  | "audio"
  | "presets"
  | "settings"
  | "help";

/** The input the canvas is built from. */
export type InputSource = "media" | "shader";

export type AnimationDirection = "loop" | "forward" | "reverse" | "ping-pong";

/* ------------------------------------------------------------------ */
/*  Effect Stack                                                       */
/*  Each stack item is an EffectInstance: a typed, toggleable layer    */
/*  with its own settings. Only Dot Matrix processes the canvas today; */
/*  the rest are scaffolded placeholders.                              */
/* ------------------------------------------------------------------ */

export type EffectType = "dot-matrix" | "halftone" | "scanline" | "grain";

/* ----- Dot Matrix (the one real effect) ----- */

/** How dots are tinted. */
export type ColorMode = "original" | "monochrome" | "brand";

export interface DotMatrixParams {
  cellSize: number; // px — grid cell edge length
  dotSize: number; // 0–1 — dot diameter as a fraction of the cell
  contrast: number; // -100..100
  brightness: number; // -100..100
  invert: boolean; // swap which tones get the big dots
  colorMode: ColorMode;
  fgColor: string; // dot color (Monochrome mode)
  bgColor: string; // canvas background
}

/* ----- Placeholder effects (settings only, no processing yet) ----- */

export type ScanlineDirection = "horizontal" | "vertical";

export interface HalftoneParams {
  cellSize: number; // px — grid spacing
  dotScale: number; // 0–1.5 — max dot size relative to the cell
  angle: number; // degrees — screen angle
  threshold: number; // 0..100 — tone cutoff below which no dot is drawn
  contrast: number; // -100..100
  invert: boolean;
  colorMode: ColorMode;
  fgColor: string; // dot color (Mono mode)
  bgColor: string; // canvas background
}

export interface ScanlineParams {
  lineCount: number;
  opacity: number; // 0..100
  direction: ScanlineDirection;
}

export interface GrainParams {
  amount: number; // 0..100
  size: number; // px
  speed: number; // animation rate
}

/** Maps each effect type to its settings shape. */
export interface EffectSettingsMap {
  "dot-matrix": DotMatrixParams;
  halftone: HalftoneParams;
  scanline: ScanlineParams;
  grain: GrainParams;
}

/** A patch may carry any settings key from any effect type. */
export type EffectSettingsPatch = Partial<
  DotMatrixParams & HalftoneParams & ScanlineParams & GrainParams
>;

interface EffectBase<T extends EffectType> {
  id: string; // unique instance id
  type: T;
  name: string;
  enabled: boolean;
  settings: EffectSettingsMap[T];
}

/** A discriminated union so `settings` narrows by `type`. */
export type EffectInstance =
  | EffectBase<"dot-matrix">
  | EffectBase<"halftone">
  | EffectBase<"scanline">
  | EffectBase<"grain">;

/* ----- Export configuration ----- */

export type ExportFormat = "png" | "jpg" | "webp" | "webm";
export type Orientation = "horizontal" | "vertical" | "square";
export type ResolutionId = "original" | "1080p" | "vertical" | "square";

/** Export framing: fit (letterbox) or crop (center-fill). */
export type ExportFraming = "fit" | "crop";
export type Fps = 24 | 30 | 60;

/** Video export container for the frame-accurate media video encoder. */
export type VideoContainer = "mp4" | "webm";

/** Video export quality tier (maps to an encoder bitrate). */
export type VideoQuality = "recommended" | "high" | "veryHigh" | "custom";

/** Video export resolution — adds 720p/4K on top of the image set. */
export type VideoResolutionId = "original" | "720p" | "1080p" | "4k";

/* ----- Shader (placeholder for a later step) ----- */

export type ShaderType = "waves" | "noise" | "voronoi" | "gradient-mesh";

/* ----- Settings ----- */

export type ThemePreference = "onyx" | "system";
export type PreviewQuality = "draft" | "balanced" | "high";

/* ----- Source media descriptor ----- */

export type MediaType = "image" | "video";

export interface SourceMedia {
  name: string;
  width: number;
  height: number;
  format: "JPG" | "PNG" | "WEBP" | "MP4" | "WEBM" | "MOV";
  sizeLabel: string;
  /** Videos only — formatted like "0:12". */
  durationLabel?: string;
}

/* ----- Static option descriptors used to render controls ----- */

export interface Option<T extends string> {
  value: T;
  label: string;
}

export interface ResolutionOption {
  id: ResolutionId;
  label: string;
  dimensions: string;
}
