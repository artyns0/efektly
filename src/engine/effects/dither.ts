import type { DitherSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Dither — the first real effect on the new stack.                   */
/*  Canvas 2D. The image is downsampled to a low-res grid (one cell    */
/*  per "point"), quantized to the chosen palette using one of four    */
/*  dithering algorithms, then scaled back up as crisp blocks.         */
/* ------------------------------------------------------------------ */

interface PaletteLevel {
  r: number;
  g: number;
  b: number;
  lum: number; // 0..1
}

// Reusable offscreen canvases (sampling in, blocks out).
let inCanvas: HTMLCanvasElement | null = null;
let inCtx: CanvasRenderingContext2D | null = null;
let outCanvas: HTMLCanvasElement | null = null;
let outCtx: CanvasRenderingContext2D | null = null;

function getInCtx(w: number, h: number): CanvasRenderingContext2D {
  if (!inCanvas) {
    inCanvas = document.createElement("canvas");
    inCtx = inCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (inCanvas.width !== w || inCanvas.height !== h) {
    inCanvas.width = w;
    inCanvas.height = h;
  }
  return inCtx!;
}

function getOutCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!outCanvas) {
    outCanvas = document.createElement("canvas");
    outCtx = outCanvas.getContext("2d");
  }
  if (outCanvas.width !== w || outCanvas.height !== h) {
    outCanvas.width = w;
    outCanvas.height = h;
  }
  return [outCanvas, outCtx!];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function buildPalette(hexes: string[]): PaletteLevel[] {
  const list = (hexes.length ? hexes : ["#131313", "#F3F0E8"]).map((hex) => {
    const { r, g, b } = hexToRgb(hex);
    return { r, g, b, lum: luminance(r, g, b) };
  });
  // Sorted by luminance so ordered dithering steps monotonically.
  return list.sort((a, b) => a.lum - b.lum);
}

/** Nearest palette entry to a target luminance. */
function nearest(levels: PaletteLevel[], v: number): PaletteLevel {
  let best = levels[0];
  let bestD = Infinity;
  for (const lvl of levels) {
    const d = Math.abs(lvl.lum - v);
    if (d < bestD) {
      bestD = d;
      best = lvl;
    }
  }
  return best;
}

/** Recursive Bayer threshold matrix (n must be a power of two). */
function bayerMatrix(n: number): number[][] {
  if (n === 1) return [[0]];
  const half = bayerMatrix(n / 2);
  const h = n / 2;
  const m: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < h; x++) {
      const v = half[y][x];
      m[y][x] = 4 * v;
      m[y][x + h] = 4 * v + 2;
      m[y + h][x] = 4 * v + 3;
      m[y + h][x + h] = 4 * v + 1;
    }
  }
  return m;
}

export function renderDither(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  s: DitherSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const point = Math.max(1, Math.round(s.pointSize));
  const cols = Math.max(1, Math.floor(dw / point));
  const rows = Math.max(1, Math.floor(dh / point));

  // 1 — downsample the source to the grid.
  const ictx = getInCtx(cols, rows);
  ictx.clearRect(0, 0, cols, rows);
  ictx.drawImage(image, 0, 0, cols, rows);
  const src = ictx.getImageData(0, 0, cols, rows).data;

  // 2 — build an adjusted luminance buffer (contrast, invert, threshold).
  const cFactor = Math.tan((((s.contrast / 100) + 1) * Math.PI) / 4);
  const bias = (50 - s.threshold) / 100; // >0 darkens, <0 lightens
  const buf = new Float32Array(cols * rows);
  const alpha = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const j = i * 4;
    let v = luminance(src[j], src[j + 1], src[j + 2]);
    v = (v - 0.5) * cFactor + 0.5;
    if (s.invert) v = 1 - v;
    v += bias;
    buf[i] = v; // may go outside 0..1; clamped at quantize time
    alpha[i] = src[j + 3] / 255;
  }

  const levels = buildPalette(s.palette);
  const gap =
    levels.length > 1
      ? (levels[levels.length - 1].lum - levels[0].lum) / (levels.length - 1)
      : 1;

  // 3 — dither into an output ImageData (one pixel per grid cell).
  const [oc, octx] = getOutCanvas(cols, rows);
  const out = octx.createImageData(cols, rows);
  const od = out.data;

  const putCell = (i: number, lvl: PaletteLevel) => {
    const j = i * 4;
    od[j] = lvl.r;
    od[j + 1] = lvl.g;
    od[j + 2] = lvl.b;
    od[j + 3] = 255;
  };

  if (s.preset === "ordered" || s.preset === "bayer") {
    const n = s.preset === "ordered" ? 4 : 8;
    const m = bayerMatrix(n);
    const denom = n * n;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const t = (m[y % n][x % n] + 0.5) / denom - 0.5; // -0.5..0.5
        const v = buf[i] + t * gap;
        putCell(i, nearest(levels, v));
      }
    }
  } else {
    // Error diffusion: Floyd–Steinberg or Atkinson.
    const atkinson = s.preset === "atkinson";
    const diffuse = (x: number, y: number, err: number, w: number) => {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return;
      buf[y * cols + x] += err * w;
    };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const lvl = nearest(levels, buf[i]);
        putCell(i, lvl);
        const err = buf[i] - lvl.lum;
        if (atkinson) {
          const w = 1 / 8;
          diffuse(x + 1, y, err, w);
          diffuse(x + 2, y, err, w);
          diffuse(x - 1, y + 1, err, w);
          diffuse(x, y + 1, err, w);
          diffuse(x + 1, y + 1, err, w);
          diffuse(x, y + 2, err, w);
        } else {
          diffuse(x + 1, y, err, 7 / 16);
          diffuse(x - 1, y + 1, err, 3 / 16);
          diffuse(x, y + 1, err, 5 / 16);
          diffuse(x + 1, y + 1, err, 1 / 16);
        }
      }
    }
  }

  // Preserve transparent source pixels.
  for (let i = 0; i < cols * rows; i++) {
    if (alpha[i] < 0.5) od[i * 4 + 3] = 0;
  }

  octx.putImageData(out, 0, 0);

  // 4 — scale the grid back up as crisp blocks over the fitted area.
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(dx, dy, dw, dh);
  ctx.drawImage(oc, 0, 0, cols, rows, dx, dy, dw, dh);
  ctx.restore();
}
