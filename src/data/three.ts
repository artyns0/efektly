import type {
  ElasticBubble3DSettings,
  ImageParticles3DSettings,
  InteractiveParticles3DSettings,
  ParticleForms3DSettings,
  ThreeToolId,
} from "../types/three";

/* ------------------------------------------------------------------ */
/*  3D workspace catalogue + defaults.                                 */
/* ------------------------------------------------------------------ */

export const THREE_TOOLS: { id: ThreeToolId; label: string }[] = [
  { id: "interactiveParticles3D", label: "Particle Form 3D" },
  { id: "imageParticles3D", label: "Image to 3D Particles" },
  { id: "particleForms3D", label: "Particle Forms 3D" },
  { id: "elasticBubble3D", label: "Elastic Bubble 3D" },
];

export function createInitialParticleForms3D(): ParticleForms3DSettings {
  return {
    shape: "sphere",
    particleCount: 8000,
    particleSize: 40,
    opacity: 85,
    glow: 60,
    softness: 55,
    speed: 1,
    turbulence: 30,
    flowStrength: 35,
    drift: 20,
    loopDuration: 8,
    shapeScale: 55,
    depth: 55,
    perspective: 45,
    thickness: 25,
    surfaceSpread: 20,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    autoRotate: true,
    colorA: "#38E1FF", // cyan
    colorB: "#B23BFF", // violet
    gradientMix: 50,
    background: "#050507",
  };
}

export function createInitialInteractiveParticles3D(): InteractiveParticles3DSettings {
  return {
    preset: "Dot Sphere",
    shape: "sphere",
    particleCount: 10000,
    pointSize: 34,
    opacity: 90,
    glow: 55,
    softness: 60,
    speed: 1,
    turbulence: 22,
    noiseAmount: 25,
    morph: 20,
    loopSpeed: 1,
    interactionRadius: 45,
    interactionStrength: 55,
    mouseMode: "repel",
    smoothing: 55,
    colorMode: "gradient",
    colorA: "#EAF2FF",
    colorB: "#7FA8FF",
    background: "#050507",
    autoRotate: true,
  };
}

/** Style presets for Particle Form 3D (one effect, many looks). */
export const INTERACTIVE_PARTICLE_PRESETS: Record<
  string,
  Partial<InteractiveParticles3DSettings>
> = {
  "Dot Sphere": {
    shape: "sphere", particleCount: 9000, pointSize: 30, glow: 45, softness: 55,
    turbulence: 12, noiseAmount: 12, morph: 8, colorMode: "solid",
    colorA: "#F4F8FF", colorB: "#BFD4FF", background: "#050507", mouseMode: "repel",
  },
  "Flow Field": {
    shape: "field", particleCount: 14000, pointSize: 24, glow: 40, softness: 65,
    turbulence: 55, noiseAmount: 70, morph: 40, colorMode: "gradient",
    colorA: "#9FE7FF", colorB: "#3A6BFF", background: "#04060A", mouseMode: "disturb",
  },
  "Chromatic Cloud": {
    shape: "cloud", particleCount: 13000, pointSize: 34, glow: 70, softness: 70,
    turbulence: 40, noiseAmount: 45, morph: 55, colorMode: "chromatic",
    colorA: "#7B5CFF", colorB: "#FF5CC8", background: "#070410", mouseMode: "attract",
  },
  "Dense White Noise": {
    shape: "blob", particleCount: 20000, pointSize: 18, glow: 30, softness: 45,
    turbulence: 65, noiseAmount: 85, morph: 35, colorMode: "solid",
    colorA: "#FFFFFF", colorB: "#CFCFCF", background: "#040404", mouseMode: "disturb",
  },
  "Neon Particle Shell": {
    shape: "shell", particleCount: 12000, pointSize: 30, glow: 85, softness: 60,
    turbulence: 18, noiseAmount: 20, morph: 14, colorMode: "gradient",
    colorA: "#FF7A1F", colorB: "#FF2FB0", background: "#0A0406", mouseMode: "repel",
  },
  "Soft Plasma Dots": {
    shape: "blob", particleCount: 11000, pointSize: 40, glow: 75, softness: 85,
    turbulence: 35, noiseAmount: 40, morph: 60, colorMode: "chromatic",
    colorA: "#5CE0FF", colorB: "#9A5CFF", background: "#05060C", mouseMode: "attract",
  },
};

export function createInitialImageParticles3D(): ImageParticles3DSettings {
  return {
    preset: "Portrait",
    depthStrength: 55,
    particleDensity: 55,
    pointSize: 38,
    brightnessInfluence: 60,
    edgeSensitivity: 45,
    zSpread: 50,
    smoothness: 40,
    contrastInfluence: 45,
    threshold: 12,
    silhouetteStrength: 40,
    colorMode: "original",
    colorA: "#FF7A1F",
    colorB: "#3A6BFF",
    glow: 45,
    opacity: 95,
    background: "#050507",
    rotationSensitivity: 50,
    autoRotate: true,
    parallaxStrength: 35,
  };
}

/** Presets for Image to 3D Particles. */
export const IMAGE_PARTICLE_PRESETS: Record<
  string,
  Partial<ImageParticles3DSettings>
> = {
  Portrait: {
    depthStrength: 55, particleDensity: 60, pointSize: 36, brightnessInfluence: 60,
    edgeSensitivity: 45, zSpread: 50, threshold: 12, colorMode: "original",
    glow: 40, background: "#050507",
  },
  "Relief Sculpt": {
    depthStrength: 80, particleDensity: 55, pointSize: 34, brightnessInfluence: 75,
    edgeSensitivity: 30, zSpread: 70, threshold: 8, contrastInfluence: 65,
    colorMode: "monochrome", colorA: "#EDEDED", glow: 25, background: "#0A0A0A",
  },
  "Neon Depth": {
    depthStrength: 65, particleDensity: 60, pointSize: 40, brightnessInfluence: 55,
    edgeSensitivity: 70, zSpread: 60, silhouetteStrength: 70, colorMode: "duotone",
    colorA: "#FF2FB0", colorB: "#2F7BFF", glow: 80, background: "#060410",
  },
  "Duotone Pop": {
    depthStrength: 45, particleDensity: 55, pointSize: 42, brightnessInfluence: 65,
    edgeSensitivity: 35, zSpread: 45, colorMode: "duotone",
    colorA: "#FF7A1F", colorB: "#12204A", glow: 50, background: "#050507",
  },
  "Edge Wire": {
    depthStrength: 60, particleDensity: 70, pointSize: 22, brightnessInfluence: 30,
    edgeSensitivity: 90, zSpread: 65, threshold: 6, silhouetteStrength: 85,
    colorMode: "monochrome", colorA: "#8FE0FF", glow: 60, background: "#04060A",
  },
};

export function createInitialElasticBubble3D(): ElasticBubble3DSettings {
  return {
    size: 55,
    stretchX: 100,
    stretchY: 100,
    stretchZ: 100,
    roundness: 60,
    surfaceSmoothness: 70,
    elasticity: 45,
    softness: 55,
    wobble: 40,
    damping: 40,
    recovery: 50,
    blobStrength: 45,
    speed: 1,
    turbulence: 40,
    noiseScale: 45,
    flow: 40,
    drift: 20,
    loopDuration: 9,
    autoMotion: true,
    windStrength: 20,
    windX: 30,
    windY: 10,
    windZ: 0,
    gust: 30,
    gloss: 65,
    reflectivity: 55,
    refraction: 40,
    fresnel: 55,
    chromatic: 55,
    rimLight: 50,
    opacity: 100,
    baseColor: "#5B7CFF", // blue-violet base
    highlightColor: "#FFE9F5",
    shadowTint: "#0A0620",
    colorShift: 45,
    emissiveTint: "#140A2E",
    background: "#050507",
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    autoRotate: true,
    lightIntensity: 70,
    lightX: 40,
    lightY: 60,
    lightZ: 50,
    cameraDistance: 50,
  };
}
