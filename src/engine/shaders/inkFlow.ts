import type { InkFlowSettings } from "../../types/shaders";
import { hexToRgb, rand, rgba } from "./shaderUtils";

/* Ink Flow — organic ink/smoke diffusion blobs. */

export function renderInkFlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: InkFlowSettings,
  t: number,
): void {
  const time = t * s.flowSpeed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const count = 4 + Math.round((s.density / 100) * 10);
  const spread = 0.15 + (s.spread / 100) * 0.4;
  const base = Math.min(w, h) * (0.15 + (s.diffusion / 100) * 0.3);

  ctx.save();
  ctx.filter = `blur(${6 + (s.softness / 100) * 30}px)`;
  for (let i = 0; i < count; i++) {
    const drift = time * (0.15 + rand(i) * 0.25);
    const x = w * (0.5 + Math.sin(drift + i * 2.1) * spread + (rand(i + 4) - 0.5) * 0.3);
    const y = h * (0.5 + Math.cos(drift * 0.8 + i * 1.4) * spread + (rand(i + 8) - 0.5) * 0.3);
    // Wobbly multi-lobe blob: 3 overlapping circles.
    const col = i % 2 ? b : a;
    for (let k = 0; k < 3; k++) {
      const r = base * (0.5 + rand(i * 3 + k) * 0.8) * (1 + 0.2 * Math.sin(time + i + k));
      const ox = Math.sin(time * 0.7 + k * 2.1 + i) * r * 0.4;
      const oy = Math.cos(time * 0.6 + k * 1.7 + i) * r * 0.4;
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      g.addColorStop(0, rgba(col, 0.4));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  if (s.noise > 0) {
    ctx.globalAlpha = (s.noise / 100) * 0.2;
    for (let i = 0; i < 250; i++) {
      const x = rand(i * 1.3 + Math.floor(time * 2)) * w;
      const y = rand(i * 2.9 + Math.floor(time * 3)) * h;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
}
