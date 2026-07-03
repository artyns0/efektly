import type { DotMatrixParams } from "../../types/app";

/* ------------------------------------------------------------------ */
/*  Dot Matrix — the first real-time effect.                           */
/*  Canvas 2D only. The source image is sampled into a grid of cells;  */
/*  each cell's brightness drives a dot's radius and (optionally) its   */
/*  color. Pure rendering — no React, no DOM state.                    */
/* ------------------------------------------------------------------ */

/** Destination rectangle (contain-fit) inside the visible canvas, in CSS px. */
export interface FitRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/** Brand palette used by the "brand" color mode. */
const FLAME = "#FF5A1F"; // bright / accent
const LINEN = "#F3F0E8"; // secondary light
const ONYX = "#131313"; // background / shadow

// A single reusable offscreen canvas for pixel sampling — avoids
// re-allocating a canvas on every slider tick.
let sampleCanvas: HTMLCanvasElement | null = null;
let sampleCtx: CanvasRenderingContext2D | null = null;

function getSampleCtx(w: number, h: number): CanvasRenderingContext2D {
  if (!sampleCanvas) {
    sampleCanvas = document.createElement("canvas");
    sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (sampleCanvas.width !== w || sampleCanvas.height !== h) {
    sampleCanvas.width = w;
    sampleCanvas.height = h;
  }
  return sampleCtx!;
}

/** Perceptual luminance (Rec. 601) normalized to 0–1. */
function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Compute the contain-fit rectangle for an image inside a canvas area.
 * Aspect ratio preserved, centered, never cropped.
 */
export function containRect(
  imgW: number,
  imgH: number,
  areaW: number,
  areaH: number,
): FitRect {
  const scale = Math.min(areaW / imgW, areaH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return { dx: (areaW - dw) / 2, dy: (areaH - dh) / 2, dw, dh };
}

/**
 * Render the Dot Matrix effect.
 *
 * @param ctx    Target 2D context (already DPR-scaled by the caller).
 * @param image  Source image to process.
 * @param rect   Contain-fit destination rect in CSS px.
 * @param params Effect parameters.
 */
export function renderDotMatrix(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  params: DotMatrixParams,
): void {
  const { dx, dy, dw, dh } = rect;
  const cell = Math.max(2, params.cellSize);

  // Number of cells across the fitted image.
  const cols = Math.max(1, Math.round(dw / cell));
  const rows = Math.max(1, Math.round(dh / cell));

  // Sample the image at grid resolution: one pixel per cell. The browser
  // downscales with averaging, giving us a clean per-cell color cheaply.
  const sctx = getSampleCtx(cols, rows);
  sctx.clearRect(0, 0, cols, rows);
  sctx.drawImage(image, 0, 0, cols, rows);
  const data = sctx.getImageData(0, 0, cols, rows).data;

  // Adjustment factors.
  const contrast = params.contrast / 100; // -1..1
  const cFactor = Math.tan(((contrast + 1) * Math.PI) / 4); // smooth contrast curve
  const bright = params.brightness / 100; // -1..1

  // Background fill (brand mode forces Onyx).
  ctx.fillStyle = params.colorMode === "brand" ? ONYX : params.bgColor;
  ctx.fillRect(dx, dy, dw, dh);

  const cellW = dw / cols;
  const cellH = dh / rows;
  const maxR = (Math.min(cellW, cellH) / 2) * params.dotSize;
  if (maxR <= 0) return;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;

      // luminance with brightness/contrast, then optional invert
      let lum = luminance(r, g, b);
      lum = (lum - 0.5) * cFactor + 0.5 + bright;
      lum = Math.min(1, Math.max(0, lum));
      const intensity = params.invert ? 1 - lum : lum;

      const radius = maxR * intensity * a;
      if (radius < 0.35) continue; // skip imperceptible dots

      ctx.fillStyle = dotColor(params, intensity, r, g, b);

      const cx = dx + (gx + 0.5) * cellW;
      const cy = dy + (gy + 0.5) * cellH;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function dotColor(
  params: DotMatrixParams,
  intensity: number,
  r: number,
  g: number,
  b: number,
): string {
  switch (params.colorMode) {
    case "original":
      return `rgb(${r}, ${g}, ${b})`;
    case "brand":
      // Bright/accent areas -> Tiger Flame; secondary light -> Soft Linen.
      return intensity >= 0.6 ? FLAME : LINEN;
    case "monochrome":
    default:
      return params.fgColor;
  }
}
