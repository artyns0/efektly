import type { EffectInstance } from "../../types/effects";
import type { ExportFraming, ResolutionId } from "../../types/app";
import {
  applyEffect,
  computeFit,
  drawBase,
  intrinsicSize,
  type MediaEl,
} from "../pipeline";
import { targetDims } from "../../utils/canvasFit";

/* ------------------------------------------------------------------ */
/*  Export rendering — the single source of truth for exported frames. */
/*                                                                     */
/*  Two clean stages:                                                  */
/*   1. renderNativeFrame: media + enabled effects at SOURCE           */
/*      resolution (never the zoomed on-screen preview).               */
/*   2. drawFramed / renderToExportCanvas: fit or crop that frame into  */
/*      an exact target resolution over an Onyx background.            */
/* ------------------------------------------------------------------ */

const ONYX = "#131313";

/** Draw media + enabled effects into `ctx` sized w × h (contain-fit). */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  media: MediaEl,
  effects: EffectInstance[],
  w: number,
  h: number,
  time: number,
): void {
  ctx.fillStyle = ONYX;
  ctx.fillRect(0, 0, w, h);
  const fit = computeFit(media, { width: w, height: h });
  if (!fit) return;
  drawBase(ctx, media, fit);
  for (const fx of effects) {
    if (fx.enabled) applyEffect(ctx, fx, fit, 1, time); // dpr 1: canvas px == CSS px
  }
}

/** A full-resolution render of the current media + effects (source aspect). */
export function renderNativeFrame(
  media: MediaEl,
  effects: EffectInstance[],
  time = performance.now(),
): HTMLCanvasElement {
  const { w, h } = intrinsicSize(media);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  renderFrame(canvas.getContext("2d")!, media, effects, canvas.width, canvas.height, time);
  return canvas;
}

export interface FramingOptions {
  mode: ExportFraming;
  cropX?: number; // 0–1, center crop = 0.5 (extension point for manual crop)
  cropY?: number;
  background?: string;
}

/**
 * Draw a finished source frame into `ctx` at exactly tw × th.
 * Fit  → whole source, aspect preserved, Onyx letterbox where it differs.
 * Crop → fill the frame, aspect preserved, overflow center-cropped.
 * Output is always exactly tw × th — never a partial/oversized render.
 */
export function drawFramed(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  tw: number,
  th: number,
  opts: FramingOptions,
): void {
  const cropX = opts.cropX ?? 0.5;
  const cropY = opts.cropY ?? 0.5;

  ctx.fillStyle = opts.background ?? ONYX;
  ctx.fillRect(0, 0, tw, th);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale =
    opts.mode === "crop"
      ? Math.max(tw / sw, th / sh) // fill
      : Math.min(tw / sw, th / sh); // contain
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (tw - dw) * cropX; // center (0.5) by default; negative for crop
  const dy = (th - dh) * cropY;
  ctx.drawImage(source, dx, dy, dw, dh);
}

/** Fit/crop a finished frame into a new canvas at the target resolution. */
export function renderToExportCanvas(
  source: HTMLCanvasElement,
  res: ResolutionId,
  opts: FramingOptions,
): HTMLCanvasElement {
  const [tw, th] = targetDims(res, source.width, source.height);
  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  drawFramed(out.getContext("2d")!, source, source.width, source.height, tw, th, opts);
  return out;
}
