import type { SlitScanSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp } from "./fxUtils";
import { getFrameContext } from "./temporalContext";
import { getHistory } from "./frameHistory";
import { videoOnlyNotice } from "./videoOnly";

/* ------------------------------------------------------------------ */
/*  Slit Scan — each output strip is read from a different past frame.  */
/*                                                                     */
/*  A bounded, downsampled frame-history buffer (see frameHistory) is    */
/*  sampled per band: the band's age (how far back in time) is driven    */
/*  by its distance from `center`, `timeDepth`, `speed` and `reverse`.   */
/*  Horizontal / vertical use axis bands; radial uses concentric rings   */
/*  centred on the frame. History resets on seek / loop / new media.     */
/* ------------------------------------------------------------------ */

const BANDS = 140;
const RINGS = 96;

export function renderSlitScan(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: SlitScanSettings,
  id: string,
): void {
  const { dx, dy, dw, dh } = rect;
  if (!getFrameContext().isVideo) {
    videoOnlyNotice(ctx, rect, input, "Slit Scan");
    return;
  }

  const maxFrames = Math.round(30 + (s.bufferLength / 100) * 90); // 30..120
  const hist = getHistory(id, maxFrames);
  hist.setMaxFrames(maxFrames);
  hist.push(input, Math.round(dw), Math.round(dh));
  if (hist.size < 2) {
    ctx.drawImage(input, dx, dy, dw, dh);
    return;
  }

  const depth =
    (s.timeDepth / 100) * (hist.size - 1) * (0.3 + (s.speed / 100) * 1.7);
  const maxAge = hist.size - 1;
  const ageAt = (pos: number): number => {
    let age = Math.round(clamp(Math.abs(pos - s.center), 0, 1) * depth);
    if (s.reverse) age = maxAge - age;
    return clamp(age, 0, maxAge);
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;

  if (s.direction === "radial") {
    const cx = dx + dw / 2;
    const cy = dy + dh / 2;
    const maxR = Math.sqrt(dw * dw + dh * dh) / 2;
    for (let k = RINGS - 1; k >= 0; k--) {
      const pos = k / RINGS;
      const f = hist.at(ageAt(pos)) ?? hist.newest();
      if (!f) continue;
      const r1 = (k / RINGS) * maxR;
      const r0 = ((k + 1) / RINGS) * maxR;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r0, 0, Math.PI * 2);
      ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
      ctx.clip("evenodd");
      ctx.drawImage(f, 0, 0, f.width, f.height, dx, dy, dw, dh);
      ctx.restore();
    }
  } else if (s.direction === "vertical") {
    for (let k = 0; k < BANDS; k++) {
      const pos = (k + 0.5) / BANDS;
      const f = hist.at(ageAt(pos)) ?? hist.newest();
      if (!f) continue;
      const sx = (k / BANDS) * f.width;
      const sw = Math.max(1, f.width / BANDS);
      ctx.drawImage(f, sx, 0, sw, f.height, dx + (k / BANDS) * dw, dy, dw / BANDS + 1, dh);
    }
  } else {
    for (let k = 0; k < BANDS; k++) {
      const pos = (k + 0.5) / BANDS;
      const f = hist.at(ageAt(pos)) ?? hist.newest();
      if (!f) continue;
      const sy = (k / BANDS) * f.height;
      const sh = Math.max(1, f.height / BANDS);
      ctx.drawImage(f, 0, sy, f.width, sh, dx, dy + (k / BANDS) * dh, dw, dh / BANDS + 1);
    }
  }

  ctx.restore();
}
