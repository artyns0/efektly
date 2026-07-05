import type { SparkBurstSettings } from "../../types/shaders";
import { hexToRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Spark Burst — stateful particle bursts with mouse-follow origin.   */
/*  Module-level particle pool; ShaderCanvas feeds pointer position.   */
/* ------------------------------------------------------------------ */

interface Spark {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; hueMix: number;
  px: number; py: number;
}

let sparks: Spark[] = [];
let lastTime = -1;
let lastBurst = -1;
let pointer: { x: number; y: number } | null = null;

/** Normalized (0–1) pointer position over the preview; null = unknown. */
export function setSparkPointer(x: number | null, y?: number): void {
  pointer = x === null ? null : { x, y: y ?? 0.5 };
}

function burst(w: number, h: number, s: SparkBurstSettings): void {
  const ox = (s.mouseFollow && pointer ? pointer.x : 0.5) * w;
  const oy = (s.mouseFollow && pointer ? pointer.y : 0.5) * h;
  const n = Math.round((s.count / 100) * 60 + 20);
  const power = (s.burstStrength / 100) * Math.min(w, h) * 0.9;
  const spreadA = (s.spread / 100) * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    if (sparks.length > 900) break; // pool cap
    const ang = Math.random() * Math.PI * 2;
    const within = Math.abs(ang % (Math.PI * 2)) <= spreadA + 0.4;
    if (!within && Math.random() > 0.4) continue;
    const v = power * (0.25 + Math.random() * 0.75);
    const maxLife = 0.7 + Math.random() * (1.6 - (s.decay / 100));
    sparks.push({
      x: ox, y: oy, px: ox, py: oy,
      vx: Math.cos(ang) * v,
      vy: Math.sin(ang) * v,
      life: maxLife, maxLife,
      size: 0.5 + Math.random() * (s.sparkSize / 100) * 3.5,
      hueMix: Math.random(),
    });
  }
}

export function renderSparkBurst(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: SparkBurstSettings,
  t: number,
): void {
  const time = t * s.speed;
  const dt = lastTime < 0 ? 0.016 : Math.min(0.05, Math.max(0.001, time - lastTime));
  lastTime = time;

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  // Auto burst on an interval; always burst once when empty.
  const interval = 1.6;
  if ((s.autoBurst && time - lastBurst > interval) || (sparks.length === 0 && lastBurst < 0)) {
    lastBurst = time;
    burst(w, h, s);
  }

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const gravity = (s.gravity / 100) * Math.min(w, h) * 0.9;
  const trail = 0.02 + (s.trailLength / 100) * 0.12;
  const glow = s.glow / 100;

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const alive: Spark[] = [];
  for (const p of sparks) {
    p.life -= dt * (0.6 + (s.decay / 100) * 1.6);
    if (p.life <= 0) continue;
    p.px = p.x;
    p.py = p.y;
    p.vy += gravity * dt;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < -20 || p.x > w + 20 || p.y > h + 20) continue;
    alive.push(p);

    const f = p.life / p.maxLife;
    const col = p.hueMix > 0.5 ? a : b;
    // Trail segment.
    ctx.strokeStyle = rgba(col, 0.5 * f);
    ctx.lineWidth = p.size;
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * trail, p.y - p.vy * trail);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // Glow head.
    if (glow > 0) {
      const r = p.size * (1.5 + glow * 4);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, rgba(col, 0.8 * f));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  sparks = alive;
  ctx.globalCompositeOperation = "source-over";
}
