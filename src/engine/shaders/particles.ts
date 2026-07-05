import type { MotionStyle, ParticlesSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Particles — stateful glowing particle field.                       */
/*  Each particle has position, velocity, life, size and an opacity     */
/*  fade; dead particles respawn so the field stays populated. Radial   */
/*  gradient glow, additive blending, smooth motion.                   */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; mix: number;
}

let pool: Particle[] = [];
let lastTime = -1;

function spawn(w: number, h: number, s: ParticlesSettings): Particle {
  const dim = Math.min(w, h);
  const ang = Math.random() * Math.PI * 2;
  const v = (0.2 + (s.spread / 100)) * dim * 0.06 * (0.4 + Math.random());
  const maxLife = 2 + Math.random() * 4;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(ang) * v,
    vy: Math.sin(ang) * v,
    life: Math.random() * maxLife, // stagger initial fades
    maxLife,
    size: (1 + (s.size / 100) * 9) * (0.5 + Math.random()),
    mix: Math.random(),
  };
}

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: ParticlesSettings,
  timeSec: number,
  _motion: MotionStyle,
): void {
  void _motion;
  const time = timeSec * s.speed;
  const dt = lastTime < 0 ? 0.016 : Math.min(0.05, Math.max(0.001, time - lastTime));
  lastTime = time;

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const count = Math.max(1, Math.round(s.count));
  // Grow / shrink the pool toward the requested count.
  while (pool.length < count) pool.push(spawn(w, h, s));
  if (pool.length > count) pool.length = count;

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const glow = s.glow / 100;

  ctx.globalCompositeOperation = "lighter";

  for (const p of pool) {
    p.life -= dt;
    if (p.life <= 0) {
      Object.assign(p, spawn(w, h, s));
      p.life = p.maxLife;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Wrap around edges for a continuous field.
    if (p.x < 0) p.x += w; else if (p.x > w) p.x -= w;
    if (p.y < 0) p.y += h; else if (p.y > h) p.y -= h;

    // Fade in/out across life (triangular envelope).
    const lf = p.life / p.maxLife;
    const fade = Math.sin(Math.min(1, lf) * Math.PI);
    const col = mixRgb(a, b, p.mix);
    const r = p.size * (1.6 + glow * 3.5);

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, rgba(col, 0.9 * fade));
    grad.addColorStop(0.4, rgba(col, 0.35 * fade * (0.4 + glow)));
    grad.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}
