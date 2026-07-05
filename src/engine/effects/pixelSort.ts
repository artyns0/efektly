import type { PixelSortSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, lum, rand } from "./fxUtils";

/* Pixel Sort — luminance-threshold run sorting at reduced resolution. */

export function renderPixelSort(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: PixelSortSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const maxSide = 420;
  const sc = Math.min(1, maxSide / Math.max(dw, dh));
  const w = Math.max(1, Math.round(dw * sc));
  const h = Math.max(1, Math.round(dh * sc));
  const bctx = getBuffer("pixelsort", w, h, true);
  bctx.clearRect(0, 0, w, h);
  bctx.drawImage(input, 0, 0, w, h);
  const img = bctx.getImageData(0, 0, w, h);
  const d = img.data;
  const orig = new Uint8ClampedArray(d);

  const horiz = s.direction === "horizontal";
  const lines = horiz ? h : w;
  const len = horiz ? w : h;
  const thr = s.threshold / 100;
  const maxRun = Math.max(2, Math.round((s.sortLength / 100) * len));
  const chaosP = s.chaos / 100;
  const preserve = s.colorPreserve / 100;

  const idx = (line: number, t: number) =>
    horiz ? (line * w + t) * 4 : (t * w + line) * 4;

  for (let line = 0; line < lines; line++) {
    if (rand(line * 17.3) < chaosP * 0.5) continue; // chaos: skip lines
    let t = 0;
    while (t < len) {
      const i = idx(line, t);
      const L = lum(d[i], d[i + 1], d[i + 2]);
      const inRun = s.invert ? L < thr : L >= thr;
      if (!inRun) {
        t++;
        continue;
      }
      // Collect the run.
      const start = t;
      while (t < len && t - start < maxRun) {
        const j = idx(line, t);
        const Lj = lum(d[j], d[j + 1], d[j + 2]);
        const ok = s.invert ? Lj < thr : Lj >= thr;
        if (!ok) break;
        t++;
      }
      const runLen = t - start;
      if (runLen < 3) continue;
      const px: [number, number, number, number, number][] = [];
      for (let k = start; k < start + runLen; k++) {
        const j = idx(line, k);
        px.push([lum(d[j], d[j + 1], d[j + 2]), d[j], d[j + 1], d[j + 2], d[j + 3]]);
      }
      px.sort((a, b) => a[0] - b[0]);
      if (rand(line * 3.1 + start) < chaosP) px.reverse();
      for (let k = 0; k < runLen; k++) {
        const j = idx(line, start + k);
        d[j] = px[k][1] * (1 - preserve) + orig[j] * preserve;
        d[j + 1] = px[k][2] * (1 - preserve) + orig[j + 1] * preserve;
        d[j + 2] = px[k][3] * (1 - preserve) + orig[j + 2] * preserve;
      }
    }
  }
  bctx.putImageData(img, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  // blend = sorted output over the original; maskStrength scales it further
  ctx.globalAlpha = clamp((s.blend / 100) * (s.maskStrength / 100) * 2, 0, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(bctx.canvas, 0, 0, w, h, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  ctx.restore();
}
