import type { MeshLiquidSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Mesh / Liquid — glossy viscous liquid surface.                     */
/*  A full-canvas gradient base with domain-warped soft blobs, glossy  */
/*  specular streaks and depth shading. Fills the whole canvas.        */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const WHITE = { r: 255, g: 255, b: 255 };

export function renderMeshLiquid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: MeshLiquidSettings,
  timeSec: number,
): void {
  const t = timeSec * s.speed;
  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const dim = Math.max(w, h);

  // Base: soft vertical A→B gradient over the background.
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);
  const base = ctx.createLinearGradient(0, 0, w * 0.3, h);
  base.addColorStop(0, rgba(mixRgb(a, b, 0.15), 1));
  base.addColorStop(1, rgba(mixRgb(a, b, 0.85), 1));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Viscous blobs — domain-warped positions, soft-blurred for a fluid look.
  const blobs = 8;
  const amp = 0.16 + (s.distortion / 100) * 0.34;
  const flow = 0.25 + (s.flow / 100) * 1.2;
  const rBase = dim * (0.26 + (s.scale / 100) * 0.42);
  const blur = 24 + (s.smoothness / 100) * 60;

  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  for (let i = 0; i < blobs; i++) {
    const ph = i * 1.4;
    const x = w * (0.5 + Math.sin(t * flow * (0.3 + 0.08 * i) + ph) * amp * 1.7);
    const y = h * (0.5 + Math.cos(t * flow * (0.24 + 0.1 * i) + ph * 1.2) * amp * 1.7);
    const r = rBase * (0.55 + 0.5 * Math.abs(Math.sin(t * 0.5 + ph)));
    const cc = i % 2 ? a : b;
    const lightMix = 0.1 + (s.highlights / 100) * 0.18 * (0.5 + 0.5 * Math.sin(t + ph));
    const light = mixRgb(cc, WHITE, lightMix);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(light, 0.9));
    g.addColorStop(0.55, rgba(cc, 0.7));
    g.addColorStop(1, rgba(cc, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Glossy specular streaks — bright soft highlights riding the surface.
  if (s.highlights > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${8 + (s.smoothness / 100) * 18}px)`;
    const hi = s.highlights / 100;
    for (let k = 0; k < 3; k++) {
      ctx.globalAlpha = hi * 0.4;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const hx = w * (0.3 + 0.4 * Math.sin(t * 0.4 + k * 2.1));
      const hy = h * (0.22 + 0.16 * k + 0.05 * Math.sin(t * 0.6 + k));
      ctx.beginPath();
      ctx.ellipse(hx, hy, w * 0.16, h * 0.028, -0.4 + 0.22 * k, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Depth shading — subtle vignette so the surface reads as 3D material.
  const vg = ctx.createRadialGradient(
    w * 0.5, h * 0.45, dim * 0.18,
    w * 0.5, h * 0.5, dim * 0.75,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}
