import type { ParticleForms3DSettings, ThreeToolId } from "../types/three";

/* ------------------------------------------------------------------ */
/*  3D workspace catalogue + defaults.                                 */
/* ------------------------------------------------------------------ */

export const THREE_TOOLS: { id: ThreeToolId; label: string }[] = [
  { id: "particleForms3D", label: "Particle Forms 3D" },
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
