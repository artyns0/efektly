import type { LiquidGlassSettings } from "../../types/shaders";
import { hexToRgb, rand, rgba } from "./shaderUtils";

/* Liquid Glass — glossy fluid gradient blobs with soft highlights. */

export function renderLiquidGlass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: LiquidGlassSettings,
  t: number,
): void {
  const time = t * s.flowSpeed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const acc = hexToRgb(s.accentColor);
  const blobs = 6;
  const base = Math.min(w, h) * (0.25 + (s.scale / 100) * 0.45);
  const warp = (s.warpAmount / 100) * 0.4;
  const dist = (s.distortion / 100) * 0.35;

  ctx.save();
  ctx.filter = `blur(${4 + (s.glassBlur / 100) * 40}px)`;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < blobs; i++) {
    const ph = i * 1.7;
    const x = w * (0.5 + Math.sin(time * (0.3 + rand(i) * 0.3) + ph) * (0.25 + dist));
    const y = h * (0.5 + Math.cos(time * (0.25 + rand(i + 9) * 0.3) + ph * 1.3) * (0.25 + warp));
    const r = base * (0.5 + rand(i + 3) * 0.7) * (1 + 0.15 * Math.sin(time + ph));
    const col = i % 3 === 2 ? acc : i % 2 ? b : a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, 0.55 * (0.5 + (s.smoothness / 100) * 0.5)));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Glossy highlight streak.
  if (s.highlightIntensity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${10 + (s.glassBlur / 100) * 20}px)`;
    ctx.globalAlpha = (s.highlightIntensity / 100) * 0.5;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(
      w * (0.35 + 0.1 * Math.sin(time * 0.4)),
      h * 0.28,
      w * 0.3, h * 0.07,
      -0.35, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  // Subtle noise.
  if (s.noise > 0) {
    ctx.globalAlpha = (s.noise / 100) * 0.15;
    for (let i = 0; i < 300; i++) {
      const x = rand(i * 2.1 + Math.floor(time * 3)) * w;
      const y = rand(i * 3.7 + Math.floor(time * 2)) * h;
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
}
