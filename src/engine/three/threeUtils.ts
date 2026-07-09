import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Shared helpers for the 3D particle tools.                          */
/* ------------------------------------------------------------------ */

/** Soft round sprite for glowing, feathered particles (softness 0–100). */
export function makeSoftSprite(softness: number): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  const core = 0.04 + (1 - softness / 100) * 0.38; // harder core when less soft
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(core, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/** Cheap smooth pseudo-noise in ~[-1,1] from 3D input (2 sins). */
export function snoise3(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 1.7 + y * 2.3 + z * 1.1) * 0.6 +
    Math.sin(x * 3.1 - y * 1.3 + z * 2.7 + 1.7) * 0.4
  );
}
