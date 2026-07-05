import type { CrtMonitorSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer } from "./fxUtils";

/* CRT Monitor — scanlines, RGB mask, curvature approximation, glow. */

export function renderCrtMonitor(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: CrtMonitorSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));
  const b = getBuffer("crt", w, h);
  b.clearRect(0, 0, w, h);

  // Base with brightness/contrast; curvature via per-slice horizontal inset.
  b.filter = `brightness(${clamp(100 + s.brightness, 20, 250)}%) contrast(${clamp(100 + s.contrast, 20, 300)}%)`;
  const slices = 24;
  const curve = (s.curvature / 100) * w * 0.045;
  for (let i = 0; i < slices; i++) {
    const y0 = (i / slices) * h;
    const sh = h / slices;
    const t = i / (slices - 1) - 0.5; // -0.5..0.5
    const inset = curve * (t * t * 4); // more inset near top/bottom
    b.drawImage(
      input,
      0, (y0 / h) * dh, dw, (sh / h) * dh,
      inset, y0, w - inset * 2, sh,
    );
  }
  b.filter = "none";

  // Phosphor glow.
  if (s.phosphorGlow > 0) {
    b.globalCompositeOperation = "lighter";
    b.globalAlpha = (s.phosphorGlow / 100) * 0.45;
    b.filter = `blur(${2 + (s.phosphorGlow / 100) * 8}px)`;
    b.drawImage(b.canvas, 0, 0);
    b.filter = "none";
    b.globalAlpha = 1;
    b.globalCompositeOperation = "source-over";
  }

  // Scanlines.
  if (s.scanlines > 0) {
    b.fillStyle = `rgba(0,0,0,${(s.scanlines / 100) * 0.45})`;
    for (let y = 0; y < h; y += 3) b.fillRect(0, y, w, 1);
  }

  // RGB mask — vertical triads.
  if (s.rgbMask > 0) {
    const a = (s.rgbMask / 100) * 0.12;
    const cols = ["rgba(255,0,0,", "rgba(0,255,0,", "rgba(0,0,255,"];
    for (let x = 0; x < w; x += 3) {
      b.fillStyle = cols[(x / 3) % 3 | 0] + a + ")";
      b.fillRect(x, 0, 1, h);
    }
  }

  // Noise.
  if (s.noise > 0) {
    const n = getBuffer("crt-noise", w >> 2 || 1, h >> 2 || 1, true);
    const img = n.createImageData(n.canvas.width, n.canvas.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    n.putImageData(img, 0, 0);
    b.globalCompositeOperation = "overlay";
    b.globalAlpha = (s.noise / 100) * 0.3;
    b.drawImage(n.canvas, 0, 0, w, h);
    b.globalAlpha = 1;
    b.globalCompositeOperation = "source-over";
  }

  // Vignette.
  if (s.vignette > 0) {
    const g = b.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${(s.vignette / 100) * 0.75})`);
    b.fillStyle = g;
    b.fillRect(0, 0, w, h);
  }

  // Flicker (time-driven).
  const flick = s.flicker > 0 ? 1 - (s.flicker / 100) * 0.12 * (0.5 + 0.5 * Math.sin(time * 0.02)) : 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.fillStyle = "#000";
  ctx.fillRect(dx, dy, dw, dh);
  ctx.globalAlpha = flick;
  ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  ctx.restore();
}
