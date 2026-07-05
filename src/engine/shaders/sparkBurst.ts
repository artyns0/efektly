import type { SparkBurstSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Spark Burst — mouse-follow particle flow.                          */
/*  Particles stream continuously from the cursor while it moves;      */
/*  emission fades when idle and stops when the pointer leaves. No      */
/*  fireworks explosion. ShaderCanvas feeds the pointer position.      */
/* ------------------------------------------------------------------ */

interface Spark {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; mix: number;
}

let sparks: Spark[] = [];
let lastTime = -1;
let pointer: { x: number; y: number } | null = null;
let prev: { x: number; y: number } | null = null;
let moveDist = 0; // normalized pointer travel since last frame

/** Normalized (0–1) pointer position over the preview; null = left canvas. */
export function setSparkPointer(x: number | null, y?: number): void {
  if (x === null) {
    pointer = null;
    prev = null;
    return;
  }
  const next = { x, y: y ?? 0.5 };
  if (pointer) moveDist += Math.hypot(next.x - pointer.x, next.y - pointer.y);
  pointer = next;
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

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const dim = Math.min(w, h);

  /* ---- emission origin + strength ---- */
  let ox = w * 0.5;
  let oy = h * 0.5;
  let emitStrength = 0; // 0..1
  let dirX = 0;
  let dirY = 0;

  if (s.mouseFollow && pointer) {
    ox = pointer.x * w;
    oy = pointer.y * h;
    if (prev) {
      dirX = (pointer.x - prev.x) * w;
      dirY = (pointer.y - prev.y) * h;
    }
    // Strong emission while moving, small idle floor while hovering.
    emitStrength = Math.min(1, 0.12 + moveDist * 22);
  } else if (s.autoBurst) {
    // Gentle drifting emitter from center (no blast).
    ox = w * (0.5 + Math.sin(time * 0.6) * 0.18);
    oy = h * (0.5 + Math.cos(time * 0.5) * 0.18);
    emitStrength = 0.5;
  }
  prev = pointer ? { ...pointer } : null;
  moveDist *= 0.4; // decay movement so idle emission fades

  /* ---- spawn new particles ---- */
  const emitCount = Math.round((s.emitRate / 100) * 22 * emitStrength);
  const speed = (s.burstStrength / 100) * dim * 0.5 + dim * 0.04;
  const spreadA = (s.spread / 100) * Math.PI; // half-angle
  const baseAng = Math.atan2(dirY, dirX);
  const hasDir = Math.hypot(dirX, dirY) > 0.5;
  for (let i = 0; i < emitCount && sparks.length < s.count; i++) {
    // Scatter around the motion direction (or fully radial when still).
    const ang = hasDir
      ? baseAng + (Math.random() - 0.5) * 2 * (spreadA + 0.2)
      : Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random() * 0.75);
    const maxLife = 0.5 + Math.random() * (1.8 - (s.decay / 100) * 1.2);
    sparks.push({
      x: ox + (Math.random() - 0.5) * dim * 0.02,
      y: oy + (Math.random() - 0.5) * dim * 0.02,
      vx: Math.cos(ang) * v + dirX * 0.4,
      vy: Math.sin(ang) * v + dirY * 0.4,
      life: maxLife, maxLife,
      size: 0.6 + Math.random() * (s.sparkSize / 100) * 4,
      mix: Math.random(),
    });
  }

  /* ---- integrate + draw ---- */
  const gravity = (s.gravity / 100) * dim * 0.6;
  const dragK = Math.max(0, 1 - (s.drag / 100) * 3 * dt);
  const trail = 0.02 + (s.trailLength / 100) * 0.14;
  const glow = s.glow / 100;

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const alive: Spark[] = [];
  for (const p of sparks) {
    p.life -= dt * (0.5 + (s.decay / 100) * 1.8);
    if (p.life <= 0) continue;
    p.vy += gravity * dt;
    p.vx *= dragK;
    p.vy *= dragK;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) continue;
    alive.push(p);

    const f = p.life / p.maxLife;
    const col = mixRgb(a, b, p.mix);

    // Glow halo.
    if (glow > 0) {
      const r = p.size * (1.6 + glow * 5);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, rgba(col, 0.7 * f));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Trail streak toward the head.
    ctx.strokeStyle = rgba(col, 0.55 * f);
    ctx.lineWidth = p.size;
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * trail, p.y - p.vy * trail);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // Bright core.
    ctx.fillStyle = rgba(mixRgb(col, { r: 255, g: 255, b: 255 }, 0.5), 0.9 * f);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  sparks = alive;
  ctx.globalCompositeOperation = "source-over";
}
