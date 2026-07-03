import type { MotionStyle, ParticlesSettings } from "../../types/shaders";
import { hexToRgb, rand, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Particles — simple animated glowing particles (v1).                */
/*  Deterministic positions drift over time; radial-gradient glow.     */
/* ------------------------------------------------------------------ */

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: ParticlesSettings,
  timeSec: number,
  _motion: MotionStyle,
): void {
  void _motion;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const count = Math.max(1, Math.round(s.count));
  const t = timeSec * s.speed;
  const maxR = 1 + (s.size / 100) * 9;
  const spread = 0.2 + (s.spread / 100) * 0.8;
  const glow = s.glow / 100;

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < count; i++) {
    const seedX = rand(i * 2 + 1);
    const seedY = rand(i * 2 + 2);
    const speed = 0.2 + rand(i + 5) * 0.8;
    const dir = rand(i + 9) * Math.PI * 2;

    // Drift with wrap-around.
    let x = (seedX + Math.cos(dir) * t * 0.03 * speed * spread) % 1;
    let y = (seedY + Math.sin(dir) * t * 0.03 * speed * spread) % 1;
    if (x < 0) x += 1;
    if (y < 0) y += 1;
    const px = x * w;
    const py = y * h;

    const r = maxR * (0.5 + 0.5 * rand(i + 3));
    const flick = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const col = rand(i + 11) > 0.5 ? a : b;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r * (2 + glow * 3));
    grad.addColorStop(0, rgba(col, 0.9 * flick));
    grad.addColorStop(0.4, rgba(col, 0.35 * flick * (0.4 + glow)));
    grad.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r * (2 + glow * 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}
