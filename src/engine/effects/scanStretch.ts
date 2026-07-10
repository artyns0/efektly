import type { ScanStretchSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, rand } from "./fxUtils";

/* Scan Stretch — directional scan-band smear (Canvas 2D). */

const FLAME = "#FF5A1F";

export function renderScanStretch(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: ScanStretchSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));
  const bctx = getBuffer("scanstretch", w, h);
  const buf = bctx.canvas;
  bctx.clearRect(0, 0, w, h);
  bctx.drawImage(input, 0, 0, w, h);

  const horiz = s.direction === "horizontal";
  const span = horiz ? h : w;
  // scanWidth is authored against a ~720px reference; scale it with the actual
  // span so the bands cover the same fraction at preview and full-res export
  // (an absolute px band collapses into invisible slivers at 4K otherwise).
  const band = clamp((s.scanWidth * span) / 720, 2, span * 0.5);
  const stretch = 1 + (s.stretchAmount / 100) * 20;
  const densityP = s.density / 100;
  const jit = (s.jitter / 100) * band * 2;
  const thr = s.threshold / 100;

  for (let pos = 0, i = 0; pos < span; pos += band, i++) {
    let active = rand(i * 13.7) < densityP;
    if (thr > 0 && rand(i * 91.3) < thr) active = s.invert ? active : !active;
    if (!active) continue;
    const alpha = 1 - (s.fade / 100) * rand(i * 5.1);
    const off = (rand(i * 3.3) - 0.5) * jit;
    bctx.globalAlpha = clamp(alpha, 0.05, 1);
    const sliceSize = Math.max(1, Math.round(band / stretch));
    if (horiz) {
      bctx.drawImage(input, 0, pos + off, dw, sliceSize, 0, pos, w, band);
    } else {
      bctx.drawImage(input, pos + off, 0, sliceSize, dh, pos, 0, band, h);
    }
  }
  bctx.globalAlpha = 1;

  // Composite with tone / contrast handling.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.clearRect(dx, dy, dw, dh);
  const parts: string[] = [`contrast(${clamp(100 + s.contrast, 10, 300)}%)`];
  if (s.colorMode === "mono") parts.push("grayscale(1)");
  if (s.colorMode === "brand")
    parts.push("grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg)");
  ctx.filter = parts.join(" ");
  ctx.drawImage(buf, 0, 0, w, h, dx, dy, dw, dh);
  ctx.filter = "none";
  if (s.colorMode === "brand") {
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = FLAME;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}
