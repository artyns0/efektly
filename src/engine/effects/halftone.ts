import type { HalftoneParams } from "../../types/app";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Halftone — classic screened dots on an angled grid.               */
/*  Canvas 2D only. The source is sampled on a rotated lattice; each   */
/*  sample's brightness drives a dot's radius and color.              */
/* ------------------------------------------------------------------ */

const FLAME = "#FF5A1F"; // strong / accent
const LINEN = "#F3F0E8"; // light tones
const ONYX = "#131313"; // background / shadow

// Reusable offscreen canvas for pixel sampling.
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

export function renderHalftone(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  p: HalftoneParams,
): void {
  const { dx, dy, dw, dh } = rect;
  const cell = Math.max(2, p.cellSize);

  // Sample the source at a capped resolution (point sampling per dot).
  const maxSide = 900;
  const sScale = Math.min(1, maxSide / Math.max(dw, dh));
  const sw = Math.max(1, Math.round(dw * sScale));
  const sh = Math.max(1, Math.round(dh * sScale));
  const sctx = getSampleCtx(sw, sh);
  sctx.clearRect(0, 0, sw, sh);
  sctx.drawImage(image, 0, 0, sw, sh);
  const data = sctx.getImageData(0, 0, sw, sh).data;

  const contrast = p.contrast / 100;
  const cFactor = Math.tan(((contrast + 1) * Math.PI) / 4);
  const threshold = Math.min(0.999, p.threshold / 100);

  // Background (brand mode forces Onyx).
  ctx.fillStyle = p.colorMode === "brand" ? ONYX : p.bgColor;
  ctx.fillRect(dx, dy, dw, dh);

  // Keep angled dots inside the image area.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  const cx = dx + dw / 2;
  const cy = dy + dh / 2;
  const ang = (p.angle * Math.PI) / 180;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const maxR = (cell / 2) * p.dotScale;

  // The rotated lattice must cover the rect's half-diagonal in each axis.
  const half = Math.sqrt(dw * dw + dh * dh) / 2;
  const steps = Math.ceil(half / cell) + 1;

  for (let gy = -steps; gy <= steps; gy++) {
    for (let gx = -steps; gx <= steps; gx++) {
      // Lattice point (relative to center), rotated into canvas space.
      const rx = gx * cell;
      const ry = gy * cell;
      const x = cx + rx * cos - ry * sin;
      const y = cy + rx * sin + ry * cos;
      if (x < dx || x >= dx + dw || y < dy || y >= dy + dh) continue;

      // Nearest source pixel.
      const sx = Math.min(sw - 1, Math.max(0, Math.floor(((x - dx) / dw) * sw)));
      const sy = Math.min(sh - 1, Math.max(0, Math.floor(((y - dy) / dh) * sh)));
      const i = (sy * sw + sx) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;

      let lum = luminance(r, g, b);
      lum = (lum - 0.5) * cFactor + 0.5;
      lum = Math.min(1, Math.max(0, lum));
      const intensity = p.invert ? 1 - lum : lum;
      if (intensity < threshold) continue;

      // Grow dots from zero at the threshold up to full at intensity 1.
      const t = (intensity - threshold) / (1 - threshold);
      const radius = maxR * t * a;
      if (radius < 0.3) continue;

      ctx.fillStyle = dotColor(p, intensity, r, g, b);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function dotColor(
  p: HalftoneParams,
  intensity: number,
  r: number,
  g: number,
  b: number,
): string {
  switch (p.colorMode) {
    case "original":
      return `rgb(${r}, ${g}, ${b})`;
    case "brand":
      return intensity >= 0.6 ? FLAME : LINEN;
    case "monochrome":
    default:
      return p.fgColor;
  }
}
