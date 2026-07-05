import type { OrbitParticlesSettings } from "../../types/shaders";
import { hexToRgb, rand, rgba } from "./shaderUtils";

/* Orbit Particles — glowing particles orbiting a center point. */

export function renderOrbitParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: OrbitParticlesSettings,
  t: number,
): void {
  const time = t * s.orbitSpeed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const cx = s.centerX * w;
  const cy = s.centerY * h;
  const baseR = Math.min(w, h) * (0.1 + (s.radius / 100) * 0.42);
  const spread = (s.spread / 100) * baseR;
  const maxSize = 1 + (s.particleSize / 100) * 6;
  const glow = s.glow / 100;
  const count = Math.max(1, Math.round(s.count));

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i++) {
    const speed = 0.4 + rand(i) * 0.8;
    const ang = rand(i + 7) * Math.PI * 2 + time * speed;
    const r = baseR + (rand(i + 3) - 0.5) * 2 * spread;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r * 0.85;
    const size = maxSize * (0.4 + rand(i + 5) * 0.6);
    const col = rand(i + 11) > 0.5 ? a : b;
    const flick = 0.6 + 0.4 * Math.sin(time * 2 + i);
    const rad = size * (1.5 + glow * 3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(col, 0.9 * flick));
    g.addColorStop(0.5, rgba(col, 0.3 * flick * (0.3 + glow)));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}
