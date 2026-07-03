/* ------------------------------------------------------------------ */
/*  Shader Mode types — procedural visuals, independent of media/effects.*/
/* ------------------------------------------------------------------ */

export type ShaderTypeId = "dotGrid" | "meshLiquid" | "voronoi" | "particles";

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

export interface ShaderSettingsMap {
  dotGrid: DotGridSettings;
  meshLiquid: MeshLiquidSettings;
  voronoi: VoronoiSettings;
  particles: ParticlesSettings;
}

/** A partial of any one shader's settings (for updates + presets). */
export type ShaderSettingsPatch = Partial<
  DotGridSettings & MeshLiquidSettings & VoronoiSettings & ParticlesSettings
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
