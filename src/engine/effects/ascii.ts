import type { AsciiCharSet, AsciiSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { FX_REF_EDGE } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  ASCII — image to characters.                                       */
/*  Canvas 2D. The image is sampled into a grid of cells; each cell's  */
/*  brightness picks a glyph from a ramp, drawn centered in the cell.  */
/* ------------------------------------------------------------------ */

const FLAME = "#FF5A1F";
const LINEN = "#F3F0E8";
const ONYX = "#131313";

/** Ramps run dark -> bright (space is darkest, densest glyph is brightest). */
export const RAMPS: Record<AsciiCharSet, string> = {
  standard: " .:-=+*#%@",
  dense:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  minimal: " .:-#@",
  blocks: " ░▒▓█",
};

// Reusable offscreen canvas for sampling.
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

// The glyph pass is drawn here at a fixed reference resolution, then blitted to
// the output — so preview and export share one identical render and only the
// final up/down-scale differs (constant glyph coverage → matched tone).
let outCanvas: HTMLCanvasElement | null = null;
let outCtx: CanvasRenderingContext2D | null = null;

function getOutCtx(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
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

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function renderAscii(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  s: AsciiSettings,
): void {
  const { dx, dy, dw, dh } = rect;

  // Fixed reference render size: the glyph pass always runs at ~1080px on the
  // long edge, so the cell size, font pixels and grid are identical in preview
  // and export. Only the final blit to dw×dh up/down-scales — glyph coverage
  // (and therefore tone) stays the same at every output resolution.
  const long = Math.max(1, Math.max(dw, dh));
  const ow = Math.max(1, Math.round((dw / long) * FX_REF_EDGE));
  const oh = Math.max(1, Math.round((dh / long) * FX_REF_EDGE));

  const cell = Math.max(4, Math.round(s.cellSize));
  const cols = Math.max(1, Math.floor(ow / cell));
  const rows = Math.max(1, Math.floor(oh / cell));

  // Sample one averaged pixel per cell.
  const sctx = getSampleCtx(cols, rows);
  sctx.clearRect(0, 0, cols, rows);
  sctx.drawImage(image, 0, 0, cols, rows);
  const data = sctx.getImageData(0, 0, cols, rows).data;

  const ramp = RAMPS[s.charSet] ?? RAMPS.standard;
  const lastIdx = ramp.length - 1;

  // Draw the glyph pass into the fixed-size offscreen buffer.
  const [obuf, octx] = getOutCtx(ow, oh);
  octx.clearRect(0, 0, ow, oh);
  octx.fillStyle = s.colorMode === "brand" ? ONYX : s.bgColor;
  octx.fillRect(0, 0, ow, oh);

  octx.font = `${cell}px ui-monospace, "JetBrains Mono", monospace`;
  octx.textAlign = "center";
  octx.textBaseline = "middle";

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;
      if (a < 0.5) continue; // keep transparent source areas empty

      let lum = luminance(r, g, b);
      if (s.invert) lum = 1 - lum;

      const idx = Math.round(lum * lastIdx);
      const ch = ramp[idx];
      if (ch === " " || ch === undefined) continue; // nothing to draw

      const color = glyphColor(s, lum, r, g, b);
      if (!color) continue; // brand mode: dark cells stay empty
      octx.fillStyle = color;

      const cx = (gx + 0.5) * cell;
      const cy = (gy + 0.5) * cell;

      if (s.rotation) {
        // Deterministic, subtle per-cell tilt driven by brightness.
        const angle = (lum - 0.5) * 0.7; // ~ ±20°
        octx.save();
        octx.translate(cx, cy);
        octx.rotate(angle);
        octx.fillText(ch, 0, 0);
        octx.restore();
      } else {
        octx.fillText(ch, cx, cy);
      }
    }
  }

  // Blit the reference render into the fitted output area.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(obuf, 0, 0, ow, oh, dx, dy, dw, dh);
  ctx.restore();
}

/** Returns a fill color, or null when the cell should stay empty (brand dark). */
function glyphColor(
  s: AsciiSettings,
  lum: number,
  r: number,
  g: number,
  b: number,
): string | null {
  switch (s.colorMode) {
    case "original":
      return `rgb(${r}, ${g}, ${b})`;
    case "brand":
      if (lum >= 0.62) return LINEN; // bright -> Soft Linen
      if (lum >= 0.3) return FLAME; // medium/accent -> Tiger Flame
      return null; // dark -> Onyx (blends into background)
    case "mono":
    default:
      return s.fgColor;
  }
}
