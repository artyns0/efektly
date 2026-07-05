import type { NeonEdgeSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, hexToRgb, lum } from "./fxUtils";

/* Neon Edge — Sobel edges drawn as glowing colored lines. */

export function renderNeonEdge(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: NeonEdgeSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const sc = Math.min(1, 480 / Math.max(dw, dh));
  const w = Math.max(3, Math.round(dw * sc));
  const h = Math.max(3, Math.round(dh * sc));

  const src = getBuffer("neon-src", w, h, true);
  src.clearRect(0, 0, w, h);
  src.drawImage(input, 0, 0, w, h);
  const d = src.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = lum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const thr = (s.edgeThreshold / 100) * 1.4;
  const edges = getBuffer("neon-edges", w, h);
  const out = edges.createImageData(w, h);
  const od = out.data;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      let mag = Math.sqrt(gx * gx + gy * gy);
      if (s.invert) mag = mag > thr ? 0 : 1.2;
      const on = mag >= thr;
      if (!on) continue;
      const t = y / h; // gradient A -> B down the frame
      const o = i * 4;
      od[o] = a.r + (b.r - a.r) * t;
      od[o + 1] = a.g + (b.g - a.g) * t;
      od[o + 2] = a.b + (b.b - a.b) * t;
      od[o + 3] = 255;
    }
  }
  edges.putImageData(out, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  // Background: dark, mixed with the dimmed original.
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(dx, dy, dw, dh);
  if (s.backgroundMix > 0) {
    ctx.globalAlpha = clamp(s.backgroundMix / 100, 0, 1);
    ctx.drawImage(input, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }
  const inten = clamp(s.intensity / 100, 0, 1);
  const lw = 1 + (s.lineWidth / 100) * 2;
  ctx.globalCompositeOperation = "lighter";
  // Glow passes then crisp edges.
  if (s.glow > 0) {
    ctx.globalAlpha = inten * (s.glow / 100);
    ctx.filter = `blur(${2 + (s.glowRadius / 100) * 22}px)`;
    ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.filter = `blur(${1 + (s.glowRadius / 100) * 8}px)`;
    ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.filter = "none";
  }
  ctx.globalAlpha = inten;
  ctx.filter = lw > 1.5 ? `blur(${(lw - 1) * 0.6}px)` : "none";
  ctx.drawImage(edges.canvas, 0, 0, w, h, dx, dy, dw, dh);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
