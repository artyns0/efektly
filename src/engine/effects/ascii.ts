import type { AsciiCharSet, AsciiSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

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
  const cell = Math.max(4, Math.round(s.cellSize));
  const cols = Math.max(1, Math.floor(dw / cell));
  const rows = Math.max(1, Math.floor(dh / cell));

  // Sample one averaged pixel per cell.
  const sctx = getSampleCtx(cols, rows);
  sctx.clearRect(0, 0, cols, rows);
  sctx.drawImage(image, 0, 0, cols, rows);
  const data = sctx.getImageData(0, 0, cols, rows).data;

  const ramp = RAMPS[s.charSet] ?? RAMPS.standard;
  const lastIdx = ramp.length - 1;

  // Background (brand mode forces Onyx).
  ctx.save();
  ctx.fillStyle = s.colorMode === "brand" ? ONYX : s.bgColor;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  // Monospace glyphs sized to the cell.
  ctx.font = `${cell}px ui-monospace, "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

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
      ctx.fillStyle = color;

      const cx = dx + (gx + 0.5) * cell;
      const cy = dy + (gy + 0.5) * cell;

      if (s.rotation) {
        // Deterministic, subtle per-cell tilt driven by brightness.
        const angle = (lum - 0.5) * 0.7; // ~ ±20°
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(ch, cx, cy);
      }
    }
  }

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
