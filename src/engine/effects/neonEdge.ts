import type { NeonEdgeSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, hexToRgb, lum } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  Neon Edge — glowing Sobel edges on a dark field.                   */
/*                                                                     */
/*  Pipeline: luminance (lightly blurred to kill noise crawl) → Sobel   */
/*  gradient → smooth threshold (anti-aliased, stable frame-to-frame)   */
/*  → thickness dilation → single-colour edges × brightness → dark or   */
/*  dimmed-original background → multi-pass additive glow.              */
/*                                                                     */
/*  Detection runs at a fixed ≤EDGE_CAP working resolution so preview    */
/*  and full-res export produce the same edge scale and glow.           */
/* ------------------------------------------------------------------ */

const EDGE_CAP = 720;

export function renderNeonEdge(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: NeonEdgeSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const scale = Math.min(1, EDGE_CAP / Math.max(dw, dh));
  const w = Math.max(3, Math.round(dw * scale));
  const h = Math.max(3, Math.round(dh * scale));

  const src = getBuffer("neon-src", w, h, true);
  src.clearRect(0, 0, w, h);
  src.drawImage(input, 0, 0, w, h);
  const d = src.getImageData(0, 0, w, h).data;

  // Luminance with a light 3-tap horizontal+vertical smooth to reduce the
  // per-pixel noise that makes raw Sobel edges crawl between frames.
  const raw = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) raw[i] = lum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
  const gray = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const xl = x > 0 ? raw[i - 1] : raw[i];
      const xr = x < w - 1 ? raw[i + 1] : raw[i];
      const yt = y > 0 ? raw[i - w] : raw[i];
      const yb = y < h - 1 ? raw[i + w] : raw[i];
      gray[i] = (raw[i] * 2 + xl + xr + yt + yb) / 6;
    }
  }

  // Sobel gradient magnitude.
  const mag = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] +
        gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] +
        gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      mag[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Sensitivity → threshold (inverse). Smooth band gives anti-aliased,
  // flicker-resistant edges instead of a hard binary cut.
  const thr = 0.9 - (s.sensitivity / 100) * 0.78; // ~0.12 (max) .. 0.9 (min)
  const soft = 0.35 * thr + 0.03;
  const edge = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const t = (mag[i] - (thr - soft)) / (2 * soft);
    edge[i] = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); // smoothstep
  }

  // Thickness: max-pool dilation (0..3 px in working space).
  const radius = Math.round((s.thickness / 100) * 3);
  let dil = edge;
  if (radius > 0) {
    dil = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let m = 0;
        for (let oy = -radius; oy <= radius; oy++) {
          const yy = y + oy;
          if (yy < 0 || yy >= h) continue;
          for (let ox = -radius; ox <= radius; ox++) {
            const xx = x + ox;
            if (xx < 0 || xx >= w) continue;
            const v = edge[yy * w + xx];
            if (v > m) m = v;
          }
        }
        dil[y * w + x] = m;
      }
    }
  }

  // Colorize with the single neon colour × brightness.
  const col = hexToRgb(s.color);
  const bright = 0.35 + (s.brightness / 100) * 1.15;
  const edges = getBuffer("neon-edges", w, h);
  const out = edges.createImageData(w, h);
  const od = out.data;
  for (let i = 0; i < w * h; i++) {
    const e = clamp(dil[i] * bright, 0, 1);
    const o = i * 4;
    od[o] = col.r * e;
    od[o + 1] = col.g * e;
    od[o + 2] = col.b * e;
    od[o + 3] = 255;
  }
  edges.putImageData(out, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  // Background.
  if (s.background === "original") {
    ctx.fillStyle = "#050505";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalAlpha = 0.28;
    ctx.drawImage(input, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#050505";
    ctx.fillRect(dx, dy, dw, dh);
  }

  ctx.globalCompositeOperation = "lighter";
  ctx.imageSmoothingEnabled = true;

  // Glow: two blurred passes (radius scales with output size).
  const g = s.glow / 100;
  if (g > 0) {
    const gr = Math.max(dw, dh) / EDGE_CAP; // output→working scale for blur px
    ctx.globalAlpha = g * 0.9;
    ctx.filter = `blur(${Math.max(2, 8 * gr)}px)`;
    ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.globalAlpha = g * 0.6;
    ctx.filter = `blur(${Math.max(1, 3 * gr)}px)`;
    ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.filter = "none";
  }

  // Crisp edges on top.
  ctx.globalAlpha = 1;
  ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
