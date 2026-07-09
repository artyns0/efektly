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
  { id: "fluidLines", label: "Fluid Lines" },
  { id: "inkFlow", label: "Ink Flow" },
  { id: "orbitParticles", label: "Orbit Particles" },
  { id: "sparkBurst", label: "Spark Burst" },
  { id: "kineticLines", label: "Kinetic Lines" },
  { id: "auraOrb", label: "Aura Orb" },
  { id: "holoyudu", label: "Holoyudu" },
  { id: "nebulas", label: "Nebulas" },
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
    fluidLines: {
      lineCount: 24, lineWidth: 1.4, spacing: 55, amplitude: 45, frequency: 45,
      flowSpeed: 1, distortion: 35, colorA: LINEN, colorB: FLAME, background: ONYX,
    },
    inkFlow: {
      spread: 55, flowSpeed: 1, diffusion: 60, density: 45, softness: 60,
      noise: 15, colorA: FLAME, colorB: "#3A2E5C", background: "#0B0A0D",
    },
    orbitParticles: {
      count: 90, radius: 45, orbitSpeed: 1, particleSize: 35, glow: 55,
      spread: 35, centerX: 0.5, centerY: 0.5, colorA: LINEN, colorB: FLAME,
      background: ONYX,
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
    nebulas: {
      /* performance */
      pixelRatio: 65, maxIterations: 9, stepSize: 42, qualityMode: "balanced",
      /* nebula controls */
      evolutionSpeed: 0.8, fogDensity: 28, detailScale: 30, fieldRadius: 70,
      glowSoftness: 40, contrast: 50, softness: 52, flowStrength: 55,
      warp: 48, depthFade: 55, brightness: 62,
      /* color phase */
      redPhase: 30, greenPhase: 45, bluePhase: 62,
      /* motion / composition */
      drift: 30, swirl: 35, rotation: 0, centerPull: 35, spread: 45,
      loopSpeed: 1, autoAnimate: true,
      /* color / look */
      saturation: 54, highlights: 55, bloom: 45, prism: 45,
      backgroundMix: 88, colorBalance: 45,
      /* output */
      opacity: 100, colorA: "#9FD8FF", colorB: "#FFCBA8", background: "#0A0C14",
    },
  };
}

export const DEFAULT_SHADER_ANIMATION: ShaderAnimation = {
  animate: true,
  speed: 1,
  loop: true,
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
  orbitParticles: [
    { name: "Halo", settings: { count: 90, radius: 45, glow: 55, colorA: LINEN, colorB: FLAME, background: ONYX } },
    { name: "Ring Storm", settings: { count: 180, radius: 55, spread: 60, orbitSpeed: 1.6, colorA: FLAME, colorB: "#FFD8A8", background: ONYX } },
    { name: "Ice Orbit", settings: { count: 120, radius: 40, glow: 70, colorA: "#7DE3FF", colorB: "#DDE3EA", background: "#070B12" } },
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
  nebulas: [
    /* Silk Veil = default; closest to the main reference. */
    { name: "Silk Veil", settings: { redPhase: 30, greenPhase: 45, bluePhase: 62, detailScale: 30, flowStrength: 55, warp: 48, prism: 45, softness: 52, contrast: 50, highlights: 55, bloom: 45, saturation: 54, centerPull: 35, spread: 45, colorBalance: 45, brightness: 62, colorA: "#9FD8FF", colorB: "#FFCBA8", background: "#0A0C14" } },
    { name: "Spectral Bloom", settings: { redPhase: 26, greenPhase: 42, bluePhase: 60, detailScale: 36, flowStrength: 62, warp: 58, prism: 62, softness: 34, contrast: 58, highlights: 62, bloom: 50, saturation: 58, centerPull: 48, spread: 40, colorBalance: 48, brightness: 58, colorA: "#8FE6FF", colorB: "#FFB48F", background: "#0B0A12" } },
    { name: "Prism Haze", settings: { redPhase: 34, greenPhase: 48, bluePhase: 64, detailScale: 24, flowStrength: 46, warp: 40, prism: 82, softness: 55, contrast: 46, highlights: 44, bloom: 34, saturation: 52, centerPull: 24, spread: 55, colorBalance: 40, brightness: 54, colorA: "#B8E4FF", colorB: "#E8C6FF", background: "#0A0B16" } },
    { name: "Soft Aurora", settings: { redPhase: 40, greenPhase: 56, bluePhase: 72, detailScale: 26, flowStrength: 50, warp: 44, prism: 34, softness: 58, contrast: 44, highlights: 38, bloom: 30, saturation: 44, centerPull: 20, spread: 52, colorBalance: 30, brightness: 52, colorA: "#8FF0DC", colorB: "#A8C4FF", background: "#060B12" } },
    { name: "Ghost Current", settings: { redPhase: 38, greenPhase: 50, bluePhase: 62, detailScale: 22, flowStrength: 40, warp: 34, prism: 26, softness: 70, contrast: 38, highlights: 28, bloom: 22, saturation: 34, centerPull: 30, spread: 60, colorBalance: 44, brightness: 50, colorA: "#C4D8E8", colorB: "#D8CCE0", background: "#0B0D12" } },
    { name: "Halo Drift", settings: { redPhase: 28, greenPhase: 44, bluePhase: 60, detailScale: 20, flowStrength: 44, warp: 38, prism: 50, softness: 48, contrast: 50, highlights: 58, bloom: 48, saturation: 50, centerPull: 62, spread: 34, colorBalance: 52, brightness: 57, colorA: "#A8DCFF", colorB: "#FFD4B0", background: "#090B13" } },
    { name: "Radiant Fold", settings: { redPhase: 22, greenPhase: 40, bluePhase: 58, detailScale: 44, flowStrength: 70, warp: 66, prism: 56, softness: 30, contrast: 62, highlights: 66, bloom: 54, saturation: 62, centerPull: 42, spread: 38, colorBalance: 58, brightness: 60, colorA: "#7FD8FF", colorB: "#FFB07A", background: "#0C0910" } },
    { name: "Dream Plasma", settings: { redPhase: 44, greenPhase: 60, bluePhase: 78, detailScale: 34, flowStrength: 58, warp: 54, prism: 70, softness: 46, contrast: 54, highlights: 54, bloom: 46, saturation: 60, centerPull: 36, spread: 46, colorBalance: 36, brightness: 58, colorA: "#B08CFF", colorB: "#FFA8D8", background: "#0A0714" } },
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
  fluidLines: "Contour",
  inkFlow: "Ember Ink",
  orbitParticles: "Halo",
  sparkBurst: "Tiger Sparks",
  kineticLines: "Orbit Lines",
  auraOrb: "Blue Pink",
  holoyudu: "Iridescent Flow",
  nebulas: "Silk Veil",
};
