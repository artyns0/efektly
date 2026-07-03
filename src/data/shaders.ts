import type {
  ShaderAnimation,
  ShaderPreset,
  ShaderSettingsMap,
  ShaderTypeId,
} from "../types/shaders";

/* ------------------------------------------------------------------ */
/*  Shader catalogue: type labels, default parameters, and presets.    */
/* ------------------------------------------------------------------ */

const ONYX = "#131313";
const LINEN = "#F3F0E8";
const FLAME = "#FF5A1F";

export const SHADER_TYPES: { id: ShaderTypeId; label: string }[] = [
  { id: "meshLiquid", label: "Mesh / Liquid" },
  { id: "dotGrid", label: "Dot Grid" },
  { id: "voronoi", label: "Voronoi" },
  { id: "particles", label: "Particles" },
];

export function createInitialShaderSettings(): ShaderSettingsMap {
  return {
    dotGrid: {
      dotSize: 0.4,
      spacing: 26,
      pulse: 30,
      drift: 20,
      speed: 1,
      colorMode: "brand",
      colorA: LINEN,
      colorB: FLAME,
      background: ONYX,
    },
    meshLiquid: {
      scale: 50,
      distortion: 40,
      flow: 50,
      highlights: 45,
      smoothness: 60,
      speed: 1,
      colorA: FLAME,
      colorB: LINEN,
      background: ONYX,
    },
    voronoi: {
      cellCount: 28,
      borderWidth: 30,
      distortion: 25,
      rotation: 0,
      speed: 1,
      colorA: LINEN,
      colorB: FLAME,
      background: ONYX,
    },
    particles: {
      count: 160,
      size: 35,
      spread: 60,
      glow: 50,
      speed: 1,
      colorA: LINEN,
      colorB: FLAME,
      background: ONYX,
    },
  };
}

export const DEFAULT_SHADER_ANIMATION: ShaderAnimation = {
  animate: true,
  speed: 1,
  loop: true,
  motionStyle: "drift",
};

/* ----- Presets per shader type ----- */

export const SHADER_PRESETS: Record<ShaderTypeId, ShaderPreset[]> = {
  dotGrid: [
    { name: "Minimal", settings: { dotSize: 0.28, spacing: 30, pulse: 12, drift: 8, colorMode: "mono", colorA: LINEN, background: ONYX } },
    { name: "Matrix", settings: { dotSize: 0.5, spacing: 20, pulse: 45, drift: 35, colorMode: "duo", colorA: "#8CF5B0", colorB: "#1FCB6B", background: "#08120C" } },
    { name: "Warm", settings: { dotSize: 0.42, spacing: 26, pulse: 30, drift: 22, colorMode: "duo", colorA: "#E7C9A9", colorB: FLAME, background: "#1A130E" } },
    { name: "Brand", settings: { dotSize: 0.4, spacing: 26, pulse: 30, drift: 20, colorMode: "brand", colorA: LINEN, colorB: FLAME, background: ONYX } },
    { name: "Mono", settings: { dotSize: 0.36, spacing: 24, pulse: 20, drift: 12, colorMode: "mono", colorA: LINEN, background: ONYX } },
  ],
  meshLiquid: [
    { name: "Purple Flow", settings: { colorA: "#8A5CF6", colorB: "#F35C9E", background: "#0E0A18", distortion: 50, flow: 60 } },
    { name: "Soft Linen", settings: { colorA: LINEN, colorB: "#CFC9BC", background: "#1B1A16", distortion: 25, highlights: 60 } },
    { name: "Tiger Flame", settings: { colorA: FLAME, colorB: "#FFB07A", background: ONYX, distortion: 45, flow: 55 } },
    { name: "Chrome Silk", settings: { colorA: "#DDE3EA", colorB: "#8A93A0", background: "#101317", smoothness: 80, highlights: 70 } },
    { name: "Dark Matter", settings: { colorA: "#3A2E5C", colorB: "#12324A", background: "#070609", distortion: 65, flow: 45 } },
  ],
  voronoi: [
    { name: "Cells", settings: { cellCount: 28, borderWidth: 30, distortion: 20, colorA: LINEN, colorB: FLAME, background: ONYX } },
    { name: "Organic", settings: { cellCount: 40, borderWidth: 18, distortion: 55, colorA: "#E7C9A9", colorB: "#A8C0B0", background: "#12100E" } },
    { name: "Technical", settings: { cellCount: 22, borderWidth: 45, distortion: 8, colorA: "#9FD3FF", colorB: LINEN, background: "#0A0F14" } },
    { name: "Mono", settings: { cellCount: 30, borderWidth: 26, distortion: 22, colorA: LINEN, colorB: "#8A8170", background: ONYX } },
  ],
  particles: [
    { name: "Spark", settings: { count: 180, size: 30, spread: 55, glow: 65, colorA: FLAME, colorB: "#FFD8A8", background: ONYX } },
    { name: "Dust", settings: { count: 240, size: 18, spread: 70, glow: 30, colorA: LINEN, colorB: "#CFC9BC", background: "#12110E" } },
    { name: "Energy", settings: { count: 140, size: 40, spread: 45, glow: 80, colorA: "#7DE3FF", colorB: "#2A8CF0", background: "#070B12" } },
    { name: "Soft Glow", settings: { count: 120, size: 46, spread: 60, glow: 55, colorA: LINEN, colorB: FLAME, background: ONYX } },
  ],
};

/** Default preset name shown as selected per shader type. */
export const DEFAULT_PRESET: Record<ShaderTypeId, string> = {
  dotGrid: "Brand",
  meshLiquid: "Tiger Flame",
  voronoi: "Cells",
  particles: "Spark",
};
