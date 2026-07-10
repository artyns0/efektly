import type { InverseStrobeSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer } from "./fxUtils";
import { getFrameContext } from "./temporalContext";

/* ------------------------------------------------------------------ */
/*  Inverse Strobe — a four-phase cycle:                               */
/*    0) high-contrast black & white                                   */
/*    1) white flash                                                   */
/*    2) inverted negative                                             */
/*    3) white flash                                                   */
/*                                                                     */
/*  Phase is driven by the media time so export frames are             */
/*  deterministic. Until the photosensitivity warning is acknowledged   */
/*  the cycle is LOCKED to the calm B/W phase — no flashing runs.       */
/* ------------------------------------------------------------------ */

export function renderInverseStrobe(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: InverseStrobeSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));

  const cps = 0.2 + (s.speed / 100) * 6; // cycles per second
  const mt = getFrameContext().mediaTimeMs || time;
  let t = ((mt / 1000) * cps + s.phaseOffset / 100) % 1;
  if (t < 0) t += 1;
  // Locked to the non-flashing B/W phase until the warning is acknowledged.
  const seg = s.acknowledged ? Math.floor(t * 4) % 4 : 0;
  const negative = seg === 2;
  const flash = seg === 1 || seg === 3;

  // High-contrast B/W (optionally inverted) working buffer.
  const b = getBuffer("strobe", w, h);
  b.clearRect(0, 0, w, h);
  const bias = 100 + (50 - s.threshold) * 2; // threshold → brightness bias
  b.filter = `grayscale(1) brightness(${clamp(bias, 20, 200)}%) contrast(650%)${
    negative ? " invert(1)" : ""
  }`;
  b.drawImage(input, 0, 0, w, h);
  b.filter = "none";

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  // Effect Mix blends the strobe result over the untouched source.
  const mix = clamp(s.effectMix / 100, 0, 1);
  if (mix < 1) ctx.drawImage(input, dx, dy, dw, dh);
  ctx.globalAlpha = mix;
  ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
  ctx.globalAlpha = 1;

  // White flash phases.
  if (flash) {
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = clamp(s.flashIntensity / 100, 0, 1) * mix;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
