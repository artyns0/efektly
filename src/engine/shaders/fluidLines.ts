import type { FluidLinesSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* Fluid Lines — animated flowing contour line field. */

export function renderFluidLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: FluidLinesSettings,
  t: number,
): void {
  const time = t * s.flowSpeed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const n = Math.max(2, Math.round(s.lineCount));
  const spacing = (h * (0.4 + (s.spacing / 100) * 0.6)) / n;
  const amp = h * (0.02 + (s.amplitude / 100) * 0.12);
  const freq = 1 + (s.frequency / 100) * 5;
  const dist = (s.distortion / 100) * 2;

  ctx.lineWidth = Math.max(0.5, s.lineWidth);
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1 || 1);
    const cy = h / 2 + (i - n / 2) * spacing;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const xn = x / w;
      const y =
        cy +
        Math.sin(xn * freq * Math.PI * 2 + time * 0.8 + i * 0.35) * amp +
        Math.sin(xn * freq * 0.5 * Math.PI * 2 - time * 0.5 + i * dist) * amp * 0.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(mixRgb(a, b, p), 0.75);
    ctx.stroke();
  }
}
