import type { GrainSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { fxScale } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  Grain — a film/digital grain post effect.                          */
/*  Canvas 2D. Noise is generated on a small offscreen canvas (scaled  */
/*  by Size), then composited over the fitted image with the chosen    */
/*  blend mode. Regenerated over time when Speed > 0 for animation.    */
/* ------------------------------------------------------------------ */

const BLEND: Record<GrainSettings["blendMode"], GlobalCompositeOperation> = {
  normal: "source-over",
  overlay: "overlay",
  "soft-light": "soft-light",
  screen: "screen",
};

let noiseCanvas: HTMLCanvasElement | null = null;
let noiseCtx: CanvasRenderingContext2D | null = null;
let lastGen = -Infinity;
let lastW = 0;
let lastH = 0;
let lastMono = true;

function regenerate(w: number, h: number, mono: boolean): void {
  if (!noiseCanvas) {
    noiseCanvas = document.createElement("canvas");
    noiseCtx = noiseCanvas.getContext("2d");
  }
  if (noiseCanvas.width !== w || noiseCanvas.height !== h) {
    noiseCanvas.width = w;
    noiseCanvas.height = h;
  }
  const img = noiseCtx!.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    if (mono) {
      const v = (Math.random() * 255) | 0;
      d[j] = v;
      d[j + 1] = v;
      d[j + 2] = v;
    } else {
      d[j] = (Math.random() * 255) | 0;
      d[j + 1] = (Math.random() * 255) | 0;
      d[j + 2] = (Math.random() * 255) | 0;
    }
    d[j + 3] = 255;
  }
  noiseCtx!.putImageData(img, 0, 0);
}

/**
 * Composite grain over the fitted area of `ctx`.
 * @param time  performance.now() timestamp, used to pace animation.
 */
export function renderGrain(
  ctx: CanvasRenderingContext2D,
  rect: FitRect,
  s: GrainSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  if (dw < 1 || dh < 1) return;

  // Scale the grain cell with the render size so a grain speck stays the same
  // fraction of the image — matching grain in preview and full-res export.
  const size = Math.max(1, Math.round(s.size * fxScale(dw, dh)));
  const w = Math.max(1, Math.round(dw / size));
  const h = Math.max(1, Math.round(dh / size));

  // Regenerate on first use, when the tile changes, or on the animation clock.
  const interval = s.speed > 0 ? 1000 / (s.speed * 12 + 1) : Infinity;
  const dimsChanged = w !== lastW || h !== lastH || s.monochrome !== lastMono;
  if (!noiseCanvas || dimsChanged || time - lastGen >= interval) {
    regenerate(w, h, s.monochrome);
    lastGen = time;
    lastW = w;
    lastH = h;
    lastMono = s.monochrome;
  }

  const alpha = Math.min(0.85, (s.amount / 100) * 0.6);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = BLEND[s.blendMode] ?? "source-over";
  ctx.imageSmoothingEnabled = false;
  // Clip so grain stays within the image area.
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.drawImage(noiseCanvas!, 0, 0, w, h, dx, dy, dw, dh);
  ctx.restore();
}
