import type { KineticLinesSettings } from "../../types/shaders";

/* ------------------------------------------------------------------ */
/*  Kinetic Lines — procedural, seamless-loop line/dot patterns.       */
/*  All motion is driven by a normalised phase (0..1) so every mode    */
/*  loops perfectly regardless of speed / loop duration. Canvas 2D v1. */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Cheap deterministic hash → 0..1 (for stable per-index jitter). */
function h1(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export function renderKineticLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: KineticLinesSettings,
  timeSec: number,
): void {
  const fg = s.invert ? s.background : s.colorA;
  const bg = s.invert ? s.colorA : s.background;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const loop = Math.max(0.5, s.loopDuration);
  // Normalised, wrapping phase in [0,1); t is the looping angle.
  const phase = (((timeSec * (s.speed || 1)) / loop) % 1 + 1) % 1;
  const t = phase * TAU;

  const cx = (s.centerX ?? 0.5) * w;
  const cy = (s.centerY ?? 0.5) * h;
  // Base radius on the half-diagonal so patterns fill the whole canvas
  // (including corners) at any aspect ratio — no accidental inner box.
  const cover = Math.hypot(w, h) * 0.5;
  const R = cover * (0.34 + (s.scale / 100) * 0.78);
  const morph = s.morph / 100;
  const noise = s.noise / 100;
  const alpha = clamp(s.opacity / 100, 0, 1);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = s.lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = fg;
  ctx.fillStyle = fg;
  if (s.glow > 0) {
    ctx.shadowBlur = (s.glow / 100) * 26;
    ctx.shadowColor = fg;
  }
  ctx.translate(cx, cy);
  ctx.rotate((s.rotation * Math.PI) / 180);

  switch (s.mode) {
    case "waveSmear":
      drawWaveSmear(ctx, R, t, s, morph, noise);
      break;
    case "contour":
      drawContour(ctx, R, t, s, morph, noise);
      break;
    case "dotMatrix":
      drawDotMatrix(ctx, R, t, s, morph);
      break;
    case "spiral":
      drawSpiral(ctx, R, t, s, morph, noise);
      break;
    case "radialMesh":
      drawRadialMesh(ctx, R, t, s, morph);
      break;
    case "pulseBlob":
      drawPulseBlob(ctx, R, t, fg);
      break;
    case "morphStar":
      drawMorphStar(ctx, R, t, s, morph);
      break;
    case "particleGrid":
      drawParticleGrid(ctx, R, t, s);
      break;
    case "orbit":
    default:
      drawOrbit(ctx, R, t, s, morph, noise);
      break;
  }

  ctx.restore();
}

/* ----------------------------- modes ----------------------------- */

/** Overlapping orbiting rings — spirograph / torus moiré. */
function drawOrbit(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
  noise: number,
) {
  const n = clamp(Math.round(s.lineCount), 2, 120);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const ox = Math.cos(a + t) * R * 0.42 * (0.3 + morph);
    const oy = Math.sin(a - t) * R * 0.42 * (0.3 + morph);
    const jit = noise * (h1(i) - 0.5) * R * 0.1;
    const rr = R * (0.5 + 0.12 * Math.sin(a * 2 + t)) + jit;
    ctx.beginPath();
    ctx.ellipse(ox, oy, Math.abs(rr), Math.abs(rr) * 0.78, a + t * 0.5, 0, TAU);
    ctx.stroke();
  }
}

/** Horizontal smeared wave bands. */
function drawWaveSmear(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
  noise: number,
) {
  const n = clamp(Math.round(s.lineCount), 2, 90);
  const step = R * 0.06;
  const base = clamp(s.opacity / 100, 0, 1);
  for (let i = 0; i < n; i++) {
    const y = -R + (i / (n - 1)) * 2 * R;
    ctx.beginPath();
    for (let x = -R; x <= R; x += step) {
      const yy =
        y +
        Math.sin(x * 0.02 + t + i * 0.4) * R * 0.18 * (0.4 + morph) +
        Math.sin(x * 0.06 - t * 2) * R * 0.05 +
        noise * (h1(i * 31 + x) - 0.5) * R * 0.06;
      if (x === -R) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.globalAlpha = base * (0.25 + 0.6 * (i / n));
    ctx.stroke();
  }
}

/** Concentric wobbling contour rings. */
function drawContour(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
  noise: number,
) {
  const n = clamp(Math.round(s.lineCount), 2, 80);
  const lobes = 3 + Math.round(morph * 5);
  for (let i = 0; i < n; i++) {
    const base = R * (0.08 + 0.92 * (i / n));
    ctx.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += 0.12) {
      const rad =
        base +
        Math.sin(a * lobes + t + i * 0.5) * R * 0.06 * (0.5 + morph) +
        noise * (h1(i * 13 + a) - 0.5) * R * 0.03;
      const x = Math.cos(a) * rad;
      const y = Math.sin(a) * rad;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

/** Grid of dots with a travelling radial glow. */
function drawDotMatrix(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
) {
  const g = clamp(Math.round(s.lineCount), 4, 60);
  const spacing = (2 * R) / g;
  const dot = spacing * (0.16 + 0.24 * (s.lineWidth / 6));
  const gx = Math.cos(t) * R * 0.5 * (0.4 + morph);
  const gy = Math.sin(t * 1.3) * R * 0.5 * (0.4 + morph);
  for (let r = 0; r <= g; r++) {
    for (let c = 0; c <= g; c++) {
      const x = -R + c * spacing;
      const y = -R + r * spacing;
      const d = Math.hypot(x - gx, y - gy);
      const bright = clamp(1 - d / (R * 1.15), 0, 1);
      if (bright <= 0.02) continue;
      ctx.globalAlpha = bright * clamp(s.opacity / 100, 0, 1);
      ctx.beginPath();
      ctx.arc(x, y, dot * (0.35 + bright), 0, TAU);
      ctx.fill();
    }
  }
}

/** Rotating concentric squares — spiral core moiré. */
function drawSpiral(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
  noise: number,
) {
  const n = clamp(Math.round(s.lineCount), 3, 100);
  for (let i = 1; i <= n; i++) {
    const rr = R * (i / n);
    const rot = t + i * (0.06 + morph * 0.25);
    const jit = 1 + noise * (h1(i) - 0.5) * 0.2;
    ctx.beginPath();
    for (let k = 0; k <= 4; k++) {
      const a = rot + (k / 4) * TAU;
      const x = Math.cos(a) * rr * jit;
      const y = Math.sin(a) * rr * jit;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** Radial spokes + rings with a hollow core (donut mesh). */
function drawRadialMesh(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
) {
  const spokes = clamp(Math.round(s.lineCount), 6, 160);
  const inner = R * (0.16 + 0.1 * Math.sin(t));
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * TAU + t * 0.25;
    const warp = 1 + Math.sin(a * 6 + t) * 0.08 * (0.5 + morph);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * R * warp, Math.sin(a) * R * warp);
    ctx.stroke();
  }
  const rings = 5;
  for (let j = 1; j <= rings; j++) {
    const rr = inner + (R - inner) * (j / rings);
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, TAU);
    ctx.stroke();
  }
}

/** Soft pulsing radial glow blob. */
function drawPulseBlob(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  fg: string,
) {
  const pr = R * (0.55 + 0.16 * Math.sin(t));
  ctx.shadowBlur = 0;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr);
  grad.addColorStop(0, fg);
  grad.addColorStop(0.55, fg);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, pr, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

/** Four-point astroid star filled with a dot grid. */
function drawMorphStar(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
  morph: number,
) {
  const pulse = 1 + 0.08 * Math.sin(t);
  const sharp = 3 - morph * 1.6; // exponent: lower = fatter star
  const pts: [number, number][] = [];
  ctx.beginPath();
  for (let a = 0; a <= TAU + 0.01; a += 0.05) {
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const x = Math.sign(ca) * Math.pow(Math.abs(ca), sharp) * R * pulse;
    const y = Math.sign(sa) * Math.pow(Math.abs(sa), sharp) * R * pulse;
    pts.push([x, y]);
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Fill with a dot grid clipped to the star.
  ctx.save();
  ctx.clip();
  const g = clamp(Math.round(s.lineCount), 6, 60);
  const spacing = (2 * R) / g;
  const dot = spacing * 0.16;
  for (let r = 0; r <= g; r++) {
    for (let c = 0; c <= g; c++) {
      const x = -R + c * spacing;
      const y = -R + r * spacing;
      ctx.beginPath();
      ctx.arc(x, y, dot, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Grid of dots with a diagonal fade wave. */
function drawParticleGrid(
  ctx: CanvasRenderingContext2D,
  R: number,
  t: number,
  s: KineticLinesSettings,
) {
  const g = clamp(Math.round(s.lineCount), 4, 60);
  const spacing = (2 * R) / g;
  const dot = spacing * (0.14 + 0.22 * (s.lineWidth / 6));
  const base = clamp(s.opacity / 100, 0, 1);
  for (let r = 0; r <= g; r++) {
    for (let c = 0; c <= g; c++) {
      const x = -R + c * spacing;
      const y = -R + r * spacing;
      const bright = 0.5 + 0.5 * Math.sin(t + (r + c) * 0.4);
      ctx.globalAlpha = base * (0.15 + 0.85 * bright);
      ctx.beginPath();
      ctx.arc(x, y, dot * (0.5 + 0.5 * bright), 0, TAU);
      ctx.fill();
    }
  }
}
