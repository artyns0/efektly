import type { EffectInstance } from "../types/effects";
import { containRect, type FitRect } from "./effects/dotMatrix";
import { renderDither } from "./effects/dither";
import { renderAscii } from "./effects/ascii";
import { renderLineArt } from "./effects/lineArt";
import { renderGrain } from "./effects/grain";
import { renderGlitch } from "./effects/glitch";
import { renderReflectionGrid } from "./effects/reflectionGrid";
import { renderVerticalEcho } from "./effects/verticalEcho";
import { renderCrosshatch } from "./effects/crosshatch";
import { renderScanStretch } from "./effects/scanStretch";
import { renderPixelSort } from "./effects/pixelSort";
import { renderLightTrails } from "./effects/lightTrails";
import { renderCrtMonitor } from "./effects/crtMonitor";
import { renderVhsBleed } from "./effects/vhsBleed";
import { renderKaleidoscope } from "./effects/kaleidoscope";
import { renderNeonEdge } from "./effects/neonEdge";
import { renderVisionTracker } from "./effects/visionTracker";
import { renderFluxMelt } from "./effects/fluxMelt";

/* ------------------------------------------------------------------ */
/*  Effect Stack render pipeline (Canvas 2D).                          */
/*  Effects chain in stack order — each reads the current canvas. Two   */
/*  effects can animate (Grain when Speed > 0, Glitch when Animation    */
/*  is on); the caller bakes the static prefix once and re-applies the  */
/*  animated tail per frame. All five effects are implemented.         */
/* ------------------------------------------------------------------ */

export interface RenderArea {
  width: number; // CSS px
  height: number; // CSS px
}

export type { FitRect };

/** Either media element can be a canvas draw source. */
export type MediaEl = HTMLImageElement | HTMLVideoElement;

/** Intrinsic pixel size of an image or video element. */
export function intrinsicSize(el: MediaEl): { w: number; h: number } {
  return el instanceof HTMLVideoElement
    ? { w: el.videoWidth, h: el.videoHeight }
    : { w: el.naturalWidth, h: el.naturalHeight };
}

export function computeFit(el: MediaEl, area: RenderArea): FitRect | null {
  const { w, h } = intrinsicSize(el);
  if (!w || !h) return null;
  return containRect(w, h, area.width, area.height);
}

/** Whether an effect changes over time and therefore needs the RAF loop. */
export function effectAnimates(fx: EffectInstance): boolean {
  if (fx.type === "grain") return fx.settings.speed > 0;
  if (fx.type === "glitch") return fx.settings.animation;
  if (fx.type === "crtMonitor") return fx.settings.flicker > 0;
  if (fx.type === "vhsBleed")
    return fx.settings.timeDrift > 0 || fx.settings.trackingNoise > 0;
  if (fx.type === "fluxMelt") return fx.settings.turbulenceAmount > 0;
  return false;
}

// Reusable offscreen canvas that snapshots the fitted region so an effect
// can read the previous stage's output as its input.
let snap: HTMLCanvasElement | null = null;
let snapCtx: CanvasRenderingContext2D | null = null;

function snapshotInput(
  ctx: CanvasRenderingContext2D,
  fit: FitRect,
  dpr: number,
): HTMLCanvasElement {
  const w = Math.max(1, Math.round(fit.dw));
  const h = Math.max(1, Math.round(fit.dh));
  if (!snap) {
    snap = document.createElement("canvas");
    snapCtx = snap.getContext("2d");
  }
  if (snap.width !== w || snap.height !== h) {
    snap.width = w;
    snap.height = h;
  }
  snapCtx!.clearRect(0, 0, w, h);
  snapCtx!.drawImage(
    ctx.canvas,
    Math.round(fit.dx * dpr),
    Math.round(fit.dy * dpr),
    Math.round(fit.dw * dpr),
    Math.round(fit.dh * dpr),
    0,
    0,
    w,
    h,
  );
  return snap;
}

/** Draw the uploaded image/video frame contain-fit (the base for the stack). */
export function drawBase(
  ctx: CanvasRenderingContext2D,
  el: MediaEl,
  fit: FitRect,
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(el, fit.dx, fit.dy, fit.dw, fit.dh);
}

/** Apply one enabled effect over the current canvas. */
export function applyEffect(
  ctx: CanvasRenderingContext2D,
  fx: EffectInstance,
  fit: FitRect,
  dpr: number,
  time: number,
): void {
  switch (fx.type) {
    case "dither":
      renderDither(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "ascii":
      renderAscii(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "lineArt":
      renderLineArt(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "glitch":
      renderGlitch(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings, time);
      break;
    case "grain":
      renderGrain(ctx, fit, fx.settings, time); // overlay — reads canvas directly
      break;
    case "reflectionGrid":
      renderReflectionGrid(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "verticalEcho":
      renderVerticalEcho(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "crosshatch":
      renderCrosshatch(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "scanStretch":
      renderScanStretch(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "pixelSort":
      renderPixelSort(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "lightTrails":
      renderLightTrails(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "crtMonitor":
      renderCrtMonitor(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings, time);
      break;
    case "vhsBleed":
      renderVhsBleed(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings, time);
      break;
    case "kaleidoscope":
      renderKaleidoscope(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "neonEdge":
      renderNeonEdge(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "visionTracker":
      renderVisionTracker(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings);
      break;
    case "fluxMelt":
      renderFluxMelt(ctx, snapshotInput(ctx, fit, dpr), fit, fx.settings, time);
      break;
    default:
      break;
  }
}
