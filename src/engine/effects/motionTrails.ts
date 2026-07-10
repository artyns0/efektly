import type { MotionTrailsSettings, TrailBlend } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, hexToRgb } from "./fxUtils";
import { getFrameContext } from "./temporalContext";
import { videoOnlyNotice } from "./videoOnly";

/* ------------------------------------------------------------------ */
/*  Motion Trails — ghost trails from moving regions only (video-only). */
/*                                                                     */
/*  Per-pixel frame difference vs the previous frame builds a motion    */
/*  mask; only moving pixels are added into a fading feedback           */
/*  accumulator, so a static background stays sharp while moving        */
/*  objects smear. The accumulator + previous frame live at a           */
/*  downsampled resolution (bounded memory) and reset on seek / loop /  */
/*  new media via the frame context.                                   */
/* ------------------------------------------------------------------ */

const TRAIL_EDGE = 420;

const BLEND: Record<TrailBlend, GlobalCompositeOperation> = {
  screen: "screen",
  add: "lighter",
  lighten: "lighten",
  normal: "source-over",
};

interface State {
  acc: HTMLCanvasElement;
  prev: HTMLCanvasElement;
  w: number;
  h: number;
  lastToken: string;
  lastTime: number;
  frame: number;
}

const states = new Map<string, State>();

function stateFor(id: string, w: number, h: number): State {
  let st = states.get(id);
  if (!st) {
    st = {
      acc: document.createElement("canvas"),
      prev: document.createElement("canvas"),
      w: 0,
      h: 0,
      lastToken: "",
      lastTime: -Infinity,
      frame: 0,
    };
    states.set(id, st);
  }
  if (st.w !== w || st.h !== h) {
    st.acc.width = st.prev.width = w;
    st.acc.height = st.prev.height = h;
    st.w = w;
    st.h = h;
    st.acc.getContext("2d")!.clearRect(0, 0, w, h);
    st.prev.getContext("2d")!.clearRect(0, 0, w, h);
    st.frame = 0;
  }
  return st;
}

export function disposeMotionTrails(id: string): void {
  states.delete(id);
}

export function renderMotionTrails(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: MotionTrailsSettings,
  id: string,
): void {
  const { dx, dy, dw, dh } = rect;
  const fc = getFrameContext();
  if (!fc.isVideo) {
    videoOnlyNotice(ctx, rect, input, "Motion Trails");
    return;
  }

  const long = Math.max(dw, dh);
  const scale = Math.min(1, TRAIL_EDGE / long);
  const w = Math.max(2, Math.round(dw * scale));
  const h = Math.max(2, Math.round(dh * scale));
  const st = stateFor(id, w, h);

  // Reset feedback on a media discontinuity.
  if (fc.resetToken !== st.lastToken || fc.mediaTimeMs < st.lastTime - 40 || fc.mediaTimeMs > st.lastTime + 1000) {
    st.acc.getContext("2d")!.clearRect(0, 0, w, h);
    st.prev.getContext("2d")!.clearRect(0, 0, w, h);
    st.frame = 0;
  }
  st.lastToken = fc.resetToken;
  st.lastTime = fc.mediaTimeMs;

  // Current + previous frames at trail resolution.
  const curCanvas = document.createElement("canvas");
  curCanvas.width = w;
  curCanvas.height = h;
  const curCtx = curCanvas.getContext("2d")!;
  curCtx.drawImage(input, 0, 0, w, h);
  const cur = curCtx.getImageData(0, 0, w, h);
  const prevCtx = st.prev.getContext("2d")!;
  const prev = prevCtx.getImageData(0, 0, w, h);

  // Motion mask: moving pixels keep their colour, static pixels go clear.
  const thr = 0.03 + (s.motionThreshold / 100) * 0.4;
  const mask = curCtx.createImageData(w, h);
  const cd = cur.data;
  const pd = prev.data;
  const md = mask.data;
  for (let i = 0; i < cd.length; i += 4) {
    const lc = (cd[i] * 0.299 + cd[i + 1] * 0.587 + cd[i + 2] * 0.114) / 255;
    const lp = (pd[i] * 0.299 + pd[i + 1] * 0.587 + pd[i + 2] * 0.114) / 255;
    const diff = Math.abs(lc - lp);
    const a = diff > thr ? clamp((diff - thr) * 4, 0, 1) : 0;
    md[i] = cd[i];
    md[i + 1] = cd[i + 1];
    md[i + 2] = cd[i + 2];
    md[i + 3] = (a * 255) | 0;
  }
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  maskCanvas.getContext("2d")!.putImageData(mask, 0, 0);

  // Echo cadence: add every frame (off), or every N frames (single/multi).
  const spacing = s.echoMode === "off" ? 1 : Math.max(1, Math.round(2 + (s.echoSpacing / 100) * 14));
  const add = st.frame % spacing === 0;
  st.frame++;

  // Fade the accumulator, then add the moving pixels.
  const accCtx = st.acc.getContext("2d")!;
  const fadeAmt = clamp((1 - s.trailLength / 100) * 0.5 * (0.35 + (s.fade / 100) * 0.9), 0.015, 0.95);
  accCtx.globalCompositeOperation = "destination-out";
  accCtx.fillStyle = `rgba(0,0,0,${s.echoMode === "single" ? Math.max(fadeAmt, 0.4) : fadeAmt})`;
  accCtx.fillRect(0, 0, w, h);
  accCtx.globalCompositeOperation = "lighter";
  if (add) accCtx.drawImage(maskCanvas, 0, 0);
  accCtx.globalCompositeOperation = "source-over";

  // Store current as previous.
  prevCtx.clearRect(0, 0, w, h);
  prevCtx.drawImage(curCanvas, 0, 0);

  // Output: sharp current frame, then the trail accumulator on top.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.drawImage(input, dx, dy, dw, dh);

  ctx.globalCompositeOperation = BLEND[s.blendMode] ?? "screen";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(st.acc, 0, 0, w, h, dx, dy, dw, dh);

  // Optional tint over the trail.
  if (s.tintAmount > 0) {
    const t = hexToRgb(s.tint);
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = clamp(s.tintAmount / 100, 0, 1);
    ctx.fillStyle = `rgb(${t.r},${t.g},${t.b})`;
    // Only tint where the trail exists: re-mask by drawing acc as a clip is
    // costly, so a light global multiply reads fine over the dark trail.
    ctx.drawImage(st.acc, 0, 0, w, h, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
