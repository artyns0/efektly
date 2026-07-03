import type {
  AnimationDirection,
  Fps,
  Option,
  Orientation,
  ResolutionOption,
  ShaderType,
  SourceMedia,
} from "../types/app";

/* ------------------------------------------------------------------ */
/*  Static reference data for the UI shell.                            */
/*  Nothing here touches real media — it only drives the layout.       */
/* ------------------------------------------------------------------ */

export const SAMPLE_SOURCE: SourceMedia = {
  name: "Mountain Lake",
  width: 3840,
  height: 2160,
  format: "JPG",
  sizeLabel: "4.2 MB",
};

export const DIRECTIONS: Option<AnimationDirection>[] = [
  { value: "loop", label: "Loop" },
  { value: "forward", label: "Forward" },
  { value: "reverse", label: "Reverse" },
  { value: "ping-pong", label: "Ping-Pong" },
];

/** Palette mirrors the brand plus warm beige / peach / muted neutrals. */
export const DEFAULT_PALETTE: string[] = [
  "#F3F0E8", // Soft Linen
  "#FF5A1F", // Tiger Flame
  "#E7C9A9", // warm beige
  "#E09B6B", // peach
  "#CFC9BC", // muted linen-gray
  "#4A443E", // muted warm gray
];

/* ----- Export options ----- */

export const FORMAT_OPTIONS: Option<"png" | "jpg" | "webp" | "webm">[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
  { value: "webm", label: "WebM" },
];

export const ORIENTATION_OPTIONS: Option<Orientation>[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "square", label: "Square" },
];

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { id: "original", label: "Original", dimensions: "Source size" },
  { id: "1080p", label: "Full HD", dimensions: "1920 × 1080" },
  { id: "vertical", label: "Vertical", dimensions: "1080 × 1920" },
  { id: "square", label: "Square", dimensions: "1080 × 1080" },
];

export const FPS_OPTIONS: Fps[] = [24, 30, 60];

/* ----- Shader placeholders (wired up in a later step) ----- */

export const SHADER_TYPES: Option<ShaderType>[] = [
  { value: "waves", label: "Waves" },
  { value: "noise", label: "Noise" },
  { value: "voronoi", label: "Voronoi" },
  { value: "gradient-mesh", label: "Gradient Mesh" },
];

export const SHADER_PRESETS: string[] = [
  "Dune Drift",
  "Linen Fog",
  "Ember Field",
  "Slow Tide",
];
