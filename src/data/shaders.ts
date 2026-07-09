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
  { id: "auraOrb", label: "Aura Orb" },
  { id: "holoyudu", label: "Holoyudu" },
  { id: "nebulaDrift", label: "Nebula Drift" },
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
      scale: 55,
      distortion: 55,
      flow: 50,
      highlights: 55,
      smoothness: 65,
      speed: 1,
      colorA: "#B57BFF",
      colorB: "#F35C9E",
      background: "#0E0A18",
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
      count: 600, emitRate: 45, sparkSize: 32, spread: 40, gravity: 6,
      drag: 35, glow: 55, decay: 40, speed: 1, burstStrength: 30,
      trailLength: 40, mouseFollow: true, autoBurst: false,
      colorA: FLAME, colorB: "#FFD8A8", background: ONYX,
    },
    kineticLines: {
      mode: "orbit", lineCount: 40, lineWidth: 1.2, scale: 60,
      centerX: 0.5, centerY: 0.5, rotation: 0,
      morph: 45, noise: 10, glow: 20, opacity: 90, speed: 1, loopDuration: 6,
      colorA: LINEN, colorB: FLAME, background: ONYX, invert: false,
    },
    auraOrb: {
      radius: 55, edgeSoftness: 45, rimWidth: 30, roundness: 100,
      centerX: 0.5, centerY: 0.5,
      glowIntensity: 65, glowRadius: 50, auraFalloff: 45, bloomAmount: 55, bloomRadius: 45,
      flowSpeed: 1, flowScale: 45, flowDistortion: 40, innerBand: 40, plasma: 45,
      noise: 8, rotation: 0,
      colorA: "#5B7CFF", colorB: "#F35C9E", highlightColor: "#EAF0FF",
      rimColor: "#BFE0FF", background: "#040309", colorShift: 50,
      speed: 1, pulseAmount: 30, pulseSpeed: 0.6, loopDuration: 10,
    },
    holoyudu: {
      colorA: "#7B5CFF", colorB: "#38E1FF", colorC: "#FF5CC8",
      colorCount: 3, hueShift: 0, saturation: 70, blendAmount: 60,
      highlightStrength: 55, highlightAngle: 35, highlightWidth: 40,
      highlightSoftness: 55, gloss: 60,
      flowStrength: 45, flowAngle: 30, flowDensity: 45, flowSpeed: 1,
      fluidMap: 45, distortion: 35, noise: 12,
      interferenceScale: 45, bandDensity: 40, bandSoftness: 55,
      textureInfluence: 15, luminanceInfluence: 40, edgeInfluence: 30,
      opacity: 100, preserveDark: false, background: "#04040A",
    },
    nebulaDrift: {
      pixelRatio: 48, maxIterations: 5, rayStepSize: 55,
      evolutionSpeed: 1, fogDensity: 60, fractalScale: 42, cloudRadius: 62,
      glowSoftness: 65,
      redPhase: 62, greenPhase: 48, bluePhase: 30,
      loop: true, loopSpeed: 1, driftStrength: 40, flowRotation: 20,
      opacity: 100, colorA: "#8FB8FF", colorB: "#FFC7E6", background: "#05060F",
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
  auraOrb: [
    { name: "Soft Aura", settings: { colorA: "#7C9CFF", colorB: "#C9B8FF", highlightColor: "#F2F5FF", rimColor: "#DDE9FF", background: "#050510", glowIntensity: 70, bloomAmount: 60, edgeSoftness: 60, plasma: 35, flowDistortion: 30 } },
    { name: "Neon Core", settings: { colorA: "#FF3DAE", colorB: "#7A2BFF", highlightColor: "#FFFFFF", rimColor: "#FF9AE0", background: "#0A0410", glowIntensity: 80, bloomAmount: 70, bloomRadius: 55, innerBand: 55, plasma: 60 } },
    { name: "Blue Pink", settings: { colorA: "#3B6BFF", colorB: "#FF5CA8", highlightColor: "#EAF0FF", rimColor: "#BFE0FF", background: "#040309", glowIntensity: 65, bloomAmount: 55 } },
    { name: "Cosmic Rim", settings: { colorA: "#2A1E6B", colorB: "#8A5CF6", highlightColor: "#CFC0FF", rimColor: "#B9F0FF", background: "#02030A", rimWidth: 45, glowIntensity: 55, bloomAmount: 50, flowScale: 60, flowDistortion: 55 } },
    { name: "Dream Orb", settings: { colorA: "#FF9A7A", colorB: "#F35C9E", highlightColor: "#FFF3E6", rimColor: "#FFD8C0", background: "#0A0508", glowIntensity: 70, bloomAmount: 65, pulseAmount: 45, plasma: 40 } },
  ],
  holoyudu: [
    { name: "Holo Soft", settings: { colorA: "#8FA8FF", colorB: "#B8E6FF", colorC: "#E0C8FF", colorCount: 3, saturation: 55, blendAmount: 70, highlightStrength: 45, bandDensity: 30, bandSoftness: 70, flowStrength: 35, background: "#05060F" } },
    { name: "Yudu Shine", settings: { colorA: "#FF5CC8", colorB: "#7B5CFF", colorC: "#38E1FF", colorCount: 3, saturation: 85, highlightStrength: 75, gloss: 80, highlightWidth: 30, bandDensity: 45, background: "#080410" } },
    { name: "Editorial Chrome", settings: { colorA: "#DDE3EA", colorB: "#9AA6B8", colorC: "#C0CAD8", colorCount: 2, saturation: 25, highlightStrength: 70, gloss: 85, bandDensity: 35, flowStrength: 30, background: "#0B0D12" } },
    { name: "Spectrum Glow", settings: { colorA: "#FF4D4D", colorB: "#4DFF88", colorC: "#4D8CFF", colorCount: 3, saturation: 95, blendAmount: 75, bandDensity: 55, interferenceScale: 60, background: "#04060A" } },
    { name: "Iridescent Flow", settings: { colorA: "#7B5CFF", colorB: "#38E1FF", colorC: "#FF5CC8", colorCount: 3, saturation: 75, flowStrength: 65, fluidMap: 70, distortion: 55, flowSpeed: 1.4, bandDensity: 40, background: "#04040A" } },
    { name: "Dark Hologram", settings: { colorA: "#5CE0FF", colorB: "#9A5CFF", colorC: "#FF6CC0", colorCount: 3, saturation: 70, preserveDark: true, highlightStrength: 60, bandDensity: 50, background: "#020207" } },
  ],
  nebulaDrift: [
    { name: "Aurora Mist", settings: { redPhase: 40, greenPhase: 55, bluePhase: 68, fogDensity: 55, glowSoftness: 75, fractalScale: 38, cloudRadius: 68, driftStrength: 45, colorA: "#7CF0D8", colorB: "#9FB8FF", background: "#03060C" } },
    { name: "Pastel Veil", settings: { redPhase: 66, greenPhase: 50, bluePhase: 36, fogDensity: 50, glowSoftness: 82, fractalScale: 34, cloudRadius: 72, driftStrength: 32, colorA: "#BFE0FF", colorB: "#FFD6EC", background: "#06070F" } },
    { name: "Spectral Cloud", settings: { redPhase: 72, greenPhase: 40, bluePhase: 22, fogDensity: 68, glowSoftness: 60, fractalScale: 50, cloudRadius: 60, maxIterations: 7, driftStrength: 48, colorA: "#9A8CFF", colorB: "#FFB0D8", background: "#04040C" } },
    { name: "Dream Bloom", settings: { redPhase: 80, greenPhase: 58, bluePhase: 44, fogDensity: 58, glowSoftness: 88, fractalScale: 30, cloudRadius: 74, driftStrength: 38, colorA: "#FFD9A8", colorB: "#FFAFE0", background: "#080510" } },
    { name: "Soft Prism Fog", settings: { redPhase: 55, greenPhase: 62, bluePhase: 70, fogDensity: 46, glowSoftness: 72, fractalScale: 44, cloudRadius: 66, driftStrength: 55, flowRotation: 40, colorA: "#A8F0FF", colorB: "#C7B8FF", background: "#04060E" } },
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
  meshLiquid: "Purple Flow",
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
  auraOrb: "Blue Pink",
  holoyudu: "Iridescent Flow",
  nebulaDrift: "Aurora Mist",
};
