import type {
  ElasticBubble3DSettings,
  ParticleForms3DSettings,
  ThreeToolId,
} from "../types/three";

/* ------------------------------------------------------------------ */
/*  3D workspace catalogue + defaults.                                 */
/* ------------------------------------------------------------------ */

export const THREE_TOOLS: { id: ThreeToolId; label: string }[] = [
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
