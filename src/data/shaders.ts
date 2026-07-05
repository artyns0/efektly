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
  { id: "liquidGlass", label: "Liquid Glass" },
  { id: "liquidSilk", label: "Liquid Silk" },
  { id: "fluidLines", label: "Fluid Lines" },
  { id: "inkFlow", label: "Ink Flow" },
  { id: "plasmaGradient", label: "Plasma Gradient" },
  { id: "orbitParticles", label: "Orbit Particles" },
  { id: "kineticStripes", label: "Kinetic Stripes" },
  { id: "sparkBurst", label: "Spark Burst" },
  { id: "kineticLines", label: "Kinetic Lines" },
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
    liquidGlass: {
      scale: 55, flowSpeed: 1, distortion: 45, smoothness: 60,
      highlightIntensity: 55, glassBlur: 40, warpAmount: 40, noise: 8,
      colorA: FLAME, colorB: "#F35C9E", accentColor: LINEN, background: ONYX,
    },
    liquidSilk: {
      scale: 55, flow: 55, distortion: 40, highlight: 50, smoothness: 65,
      speed: 1, colorA: LINEN, colorB: FLAME, background: ONYX,
    },
    fluidLines: {
      lineCount: 24, lineWidth: 1.4, spacing: 55, amplitude: 45, frequency: 45,
      flowSpeed: 1, distortion: 35, colorA: LINEN, colorB: FLAME, background: ONYX,
    },
    inkFlow: {
      spread: 55, flowSpeed: 1, diffusion: 60, density: 45, softness: 60,
      noise: 15, colorA: FLAME, colorB: "#3A2E5C", background: "#0B0A0D",
    },
    plasmaGradient: {
      scale: 50, speed: 1, intensity: 65, contrast: 25, smoothness: 60,
      colorA: FLAME, colorB: "#8A5CF6", colorC: LINEN, background: ONYX,
    },
    orbitParticles: {
      count: 90, radius: 45, orbitSpeed: 1, particleSize: 35, glow: 55,
      spread: 35, centerX: 0.5, centerY: 0.5, colorA: LINEN, colorB: FLAME,
      background: ONYX,
    },
    kineticStripes: {
      stripeCount: 14, stripeWidth: 55, speed: 1, angle: 24, offset: 0,
      softness: 25, contrast: 70, colorA: FLAME, colorB: ONYX, background: ONYX,
    },
    sparkBurst: {
      count: 220, sparkSize: 40, spread: 55, gravity: 30, glow: 60, decay: 45,
      speed: 1, burstStrength: 60, trailLength: 35, mouseFollow: true,
      autoBurst: true, colorA: FLAME, colorB: "#FFD8A8", background: ONYX,
    },
    kineticLines: {
      mode: "orbit", lineCount: 40, lineWidth: 1.2, scale: 60, rotation: 0,
      morph: 45, noise: 10, glow: 20, opacity: 90, speed: 1, loopDuration: 6,
      colorA: LINEN, colorB: FLAME, background: ONYX, invert: false,
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
  liquidGlass: [
    { name: "Soft Candy", settings: { colorA: "#FF9AC4", colorB: "#FFD6E8", accentColor: "#FFFFFF", background: "#241019", distortion: 35, glassBlur: 55 } },
    { name: "Aurora Pink", settings: { colorA: "#F35C9E", colorB: "#8A5CF6", accentColor: "#FFD6E8", background: "#120A18", distortion: 55, highlightIntensity: 65 } },
    { name: "Purple Chrome", settings: { colorA: "#8A5CF6", colorB: "#DDE3EA", accentColor: "#FFFFFF", background: "#0E0A18", smoothness: 80, glassBlur: 30 } },
    { name: "Tiger Flow", settings: { colorA: FLAME, colorB: "#FFB07A", accentColor: LINEN, background: ONYX, distortion: 50, flowSpeed: 1.2 } },
    { name: "Milky Glass", settings: { colorA: LINEN, colorB: "#CFC9BC", accentColor: "#FFFFFF", background: "#1B1A16", glassBlur: 65, highlightIntensity: 40 } },
    { name: "Dream Melt", settings: { colorA: "#7DE3FF", colorB: "#F35C9E", accentColor: "#FFF3C4", background: "#0A0F16", distortion: 65, warpAmount: 60 } },
  ],
  liquidSilk: [
    { name: "Linen Silk", settings: { colorA: LINEN, colorB: "#CFC9BC", background: "#16140F" } },
    { name: "Flame Silk", settings: { colorA: FLAME, colorB: "#FFB07A", background: ONYX } },
    { name: "Night Silk", settings: { colorA: "#8A93A0", colorB: "#2A3442", background: "#0A0D12" } },
  ],
  fluidLines: [
    { name: "Contour", settings: { lineCount: 24, amplitude: 45, colorA: LINEN, colorB: FLAME, background: ONYX } },
    { name: "Topo", settings: { lineCount: 36, amplitude: 30, spacing: 40, colorA: "#A8C0B0", colorB: "#E7C9A9", background: "#10120E" } },
    { name: "Signal", settings: { lineCount: 14, amplitude: 70, frequency: 70, colorA: "#7DE3FF", colorB: "#2A8CF0", background: "#070B12" } },
  ],
  inkFlow: [
    { name: "Ember Ink", settings: { colorA: FLAME, colorB: "#3A2E5C", background: "#0B0A0D" } },
    { name: "Ocean Ink", settings: { colorA: "#2A8CF0", colorB: "#0E2A3A", background: "#05080C" } },
    { name: "Linen Smoke", settings: { colorA: LINEN, colorB: "#4A443E", background: "#111009" } },
  ],
  plasmaGradient: [
    { name: "Brand Plasma", settings: { colorA: FLAME, colorB: "#8A5CF6", colorC: LINEN, background: ONYX } },
    { name: "Sunset", settings: { colorA: "#FF7A4A", colorB: "#F35C9E", colorC: "#FFD8A8", background: "#160B0E" } },
    { name: "Deep Sea", settings: { colorA: "#2A8CF0", colorB: "#0E4A5C", colorC: "#7DE3FF", background: "#04070C" } },
  ],
  orbitParticles: [
    { name: "Halo", settings: { count: 90, radius: 45, glow: 55, colorA: LINEN, colorB: FLAME, background: ONYX } },
    { name: "Ring Storm", settings: { count: 180, radius: 55, spread: 60, orbitSpeed: 1.6, colorA: FLAME, colorB: "#FFD8A8", background: ONYX } },
    { name: "Ice Orbit", settings: { count: 120, radius: 40, glow: 70, colorA: "#7DE3FF", colorB: "#DDE3EA", background: "#070B12" } },
  ],
  kineticStripes: [
    { name: "Brand Bands", settings: { colorA: FLAME, colorB: ONYX, background: ONYX, stripeCount: 14 } },
    { name: "Linen Lines", settings: { colorA: LINEN, colorB: "#1B1A16", background: "#1B1A16", stripeCount: 20, softness: 40 } },
    { name: "Hazard", settings: { colorA: "#FFD34D", colorB: "#131313", background: "#131313", angle: 45, stripeCount: 10 } },
  ],
  sparkBurst: [
    { name: "Tiger Sparks", settings: { colorA: FLAME, colorB: "#FFD8A8", background: ONYX } },
    { name: "Cold Fire", settings: { colorA: "#7DE3FF", colorB: "#DDE3EA", background: "#05080C", glow: 75 } },
    { name: "Festival", settings: { colorA: "#F35C9E", colorB: "#FFD34D", background: "#0E0A12", burstStrength: 80, count: 320 } },
  ],
  kineticLines: [
    { name: "Orbit Lines", settings: { mode: "orbit", lineCount: 40, lineWidth: 1.2, scale: 60, morph: 45, glow: 20, loopDuration: 6, colorA: LINEN, background: ONYX } },
    { name: "Wave Smear", settings: { mode: "waveSmear", lineCount: 48, lineWidth: 2, scale: 70, morph: 55, glow: 12, loopDuration: 7, colorA: LINEN, background: "#050505" } },
    { name: "Contour Field", settings: { mode: "contour", lineCount: 34, lineWidth: 1, scale: 62, morph: 40, glow: 8, loopDuration: 8, colorA: LINEN, background: ONYX } },
    { name: "Dot Matrix Glow", settings: { mode: "dotMatrix", lineCount: 34, lineWidth: 3, scale: 66, morph: 40, glow: 30, loopDuration: 6, colorA: LINEN, background: "#060606" } },
    { name: "Spiral Core", settings: { mode: "spiral", lineCount: 48, lineWidth: 1, scale: 60, morph: 30, glow: 16, loopDuration: 9, colorA: LINEN, background: ONYX } },
    { name: "Radial Mesh", settings: { mode: "radialMesh", lineCount: 72, lineWidth: 0.9, scale: 60, morph: 45, glow: 14, loopDuration: 8, colorA: LINEN, background: ONYX } },
    { name: "Pulse Blob", settings: { mode: "pulseBlob", scale: 70, glow: 40, opacity: 85, loopDuration: 5, colorA: LINEN, background: "#050505" } },
    { name: "Morph Star", settings: { mode: "morphStar", lineCount: 30, lineWidth: 1.4, scale: 64, morph: 55, glow: 18, loopDuration: 7, colorA: LINEN, background: ONYX } },
    { name: "Particle Grid", settings: { mode: "particleGrid", lineCount: 30, lineWidth: 3, scale: 70, glow: 22, loopDuration: 6, colorA: LINEN, background: "#060606" } },
  ],
};

/** Default preset name shown as selected per shader type. */
export const DEFAULT_PRESET: Record<ShaderTypeId, string> = {
  dotGrid: "Brand",
  meshLiquid: "Tiger Flame",
  voronoi: "Cells",
  particles: "Spark",
  liquidGlass: "Tiger Flow",
  liquidSilk: "Flame Silk",
  fluidLines: "Contour",
  inkFlow: "Ember Ink",
  plasmaGradient: "Brand Plasma",
  orbitParticles: "Halo",
  kineticStripes: "Brand Bands",
  sparkBurst: "Tiger Sparks",
  kineticLines: "Orbit Lines",
};
