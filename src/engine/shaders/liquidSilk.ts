import type { LiquidSilkSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* Liquid Silk — smooth flowing filled silk bands. */

export function renderLiquidSilk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: LiquidSilkSettings,
  t: number,
): void {
  const time = t * s.speed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const bands = 6 + Math.round((s.smoothness / 100) * 6);
  const amp = h * (0.05 + (s.distortion / 100) * 0.18);
  const flow = 0.3 + (s.flow / 100) * 1.2;
  const sc = 1.2 + (s.scale / 100) * 2.2;

  ctx.save();
  ctx.filter = "blur(2px)";
  for (let i = 0; i < bands; i++) {
    const p = i / (bands - 1 || 1);
    const cy = h * (0.1 + 0.8 * p);
    const col = mixRgb(a, b, p);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const xn = x / w;
      const y =
        cy +
        Math.sin(xn * sc * Math.PI + time * flow + i * 0.9) * amp +
        Math.sin(xn * sc * 2.7 * Math.PI - time * flow * 0.6 + i) * amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = rgba(col, 0.16 + (s.highlight / 100) * 0.12);
    ctx.fill();
  }
  ctx.restore();

  // Sheen.
  if (s.highlight > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (s.highlight / 100) * 0.25;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0.3, "rgba(255,255,255,0)");
    g.addColorStop(0.5 + 0.08 * Math.sin(time * 0.5), "rgba(255,255,255,0.5)");
    g.addColorStop(0.7, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
