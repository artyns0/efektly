import type { VhsBleedSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, rand } from "./fxUtils";

/* VHS Bleed — channel bleed, smear, tracking noise, tape artifacts. */

export function renderVhsBleed(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: VhsBleedSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  const sc = Math.min(1, 560 / Math.max(dw, dh));
  const w = Math.max(1, Math.round(dw * sc));
  const h = Math.max(1, Math.round(dh * sc));
  const t = time * 0.001 * (0.2 + (s.timeDrift / 100) * 2);

  const src = getBuffer("vhs-src", w, h, true);
  src.clearRect(0, 0, w, h);
  src.drawImage(input, 0, 0, w, h);
  const sd = src.getImageData(0, 0, w, h).data;
  const out = src.createImageData(w, h);
  const od = out.data;

  const bleed = Math.round((s.colorBleed / 100) * w * 0.025);
  const distAmp = (s.distortion / 100) * w * 0.03;
  const jitAmp = (s.jitter / 100) * w * 0.02;
  const noiseAmp = (s.noise / 100) * 70;
  const cx = (x: number) => clamp(x, 0, w - 1);

  for (let y = 0; y < h; y++) {
    const wave = Math.sin(y * 0.05 + t * 3) * distAmp;
    const jr = (rand(y * 3.7 + Math.floor(t * 7)) - 0.5) * jitAmp;
    const off = Math.round(wave + jr);
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const xr = cx(x - off - bleed);
      const xg = cx(x - off);
      const xb = cx(x - off + bleed);
      const o = (row + x) * 4;
      let r = sd[(row + xr) * 4];
      let g = sd[(row + xg) * 4 + 1];
      let bl = sd[(row + xb) * 4 + 2];
      if (noiseAmp > 0) {
        const n = (Math.random() - 0.5) * noiseAmp;
        r += n; g += n; bl += n;
      }
      od[o] = r; od[o + 1] = g; od[o + 2] = bl;
      od[o + 3] = sd[(row + xg) * 4 + 3];
    }
  }
  src.putImageData(out, 0, 0);

  // Horizontal smear: additive offset ghosts.
  if (s.horizontalSmear > 0) {
    const n = 4;
    const total = (s.horizontalSmear / 100) * w * 0.06;
    src.globalCompositeOperation = "lighter";
    for (let i = 1; i <= n; i++) {
      src.globalAlpha = 0.12 * (1 - i / (n + 1));
      src.drawImage(src.canvas, (total * i) / n, 0);
    }
    src.globalAlpha = 1;
    src.globalCompositeOperation = "source-over";
  }

  // Tracking noise band drifting vertically.
  if (s.trackingNoise > 0) {
    const bandH = Math.max(3, h * 0.05);
    const y = ((t * 40) % (h + bandH * 2)) - bandH;
    src.globalAlpha = (s.trackingNoise / 100) * 0.8;
    src.fillStyle = "rgba(235,235,235,0.5)";
    for (let x = 0; x < w; x += 3) {
      if (Math.random() > 0.4) src.fillRect(x, y + Math.random() * bandH, 3, 1.5);
    }
    src.globalAlpha = 1;
  }

  // Scanlines.
  if (s.scanlines > 0) {
    src.fillStyle = `rgba(0,0,0,${(s.scanlines / 100) * 0.35})`;
    for (let y = 0; y < h; y += 3) src.fillRect(0, y, w, 1);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.clearRect(dx, dy, dw, dh);
  ctx.filter = `saturate(${clamp(s.saturation, 0, 300)}%)`;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src.canvas, 0, 0, w, h, dx, dy, dw, dh);
  ctx.filter = "none";
  ctx.restore();
}
