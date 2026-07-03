import type { LineArtSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Line Art — edge detection to clean strokes.                        */
/*  Canvas 2D. The image is greyscaled, run through a Sobel filter,     */
/*  thresholded (with soft falloff), optionally dilated for weight,     */
/*  and composited as dark lines over a light background. Wave adds a   */
/*  subtle hand-drawn wobble; Fill layers faint tonal shading.         */
/* ------------------------------------------------------------------ */

// Reusable offscreen canvases.
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

function getOut(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
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

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function renderLineArt(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  s: LineArtSettings,
): void {
  const { dx, dy, dw, dh } = rect;

  // Working resolution (capped for performance).
  const maxSide = 800;
  const scale = Math.min(1, maxSide / Math.max(dw, dh));
  const w = Math.max(1, Math.round(dw * scale));
  const h = Math.max(1, Math.round(dh * scale));

  const ictx = getInCtx(w, h);
  ictx.clearRect(0, 0, w, h);
  ictx.drawImage(image, 0, 0, w, h);
  const src = ictx.getImageData(0, 0, w, h).data;

  // Greyscale (0..1).
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    gray[i] = (0.299 * src[j] + 0.587 * src[j + 1] + 0.114 * src[j + 2]) / 255;
  }

  // Sobel edge magnitude.
  const mag = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const tl = gray[i - w - 1], tc = gray[i - w], tr = gray[i - w + 1];
      const ml = gray[i - 1], mr = gray[i + 1];
      const bl = gray[i + w - 1], bc = gray[i + w], br = gray[i + w + 1];
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      mag[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Threshold + soft falloff -> edge strength (0..1).
  const center = (s.threshold / 100) * 2; // Sobel mag scale ~0..2.8
  const hw = (s.softness / 100) * 0.9 + 0.02;
  const edge = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let e = smoothstep(center - hw, center + hw, mag[i]);
    e = Math.min(1, e * s.lineWeight);
    edge[i] = e;
  }

  // Dilation (max-pool) driven by Thickness -> bolder lines.
  const radius = Math.min(2, Math.max(0, Math.round(s.thickness / 3)));
  let edgeD = edge;
  if (radius > 0) {
    edgeD = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let m = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const yy = y + ky;
          if (yy < 0 || yy >= h) continue;
          for (let kx = -radius; kx <= radius; kx++) {
            const xx = x + kx;
            if (xx < 0 || xx >= w) continue;
            const v = edge[yy * w + xx];
            if (v > m) m = v;
          }
        }
        edgeD[y * w + x] = m;
      }
    }
  }

  // Colors — invert swaps line/background roles.
  const bg = hexToRgb(s.invert ? s.lineColor : s.bgColor);
  const line = hexToRgb(s.invert ? s.bgColor : s.lineColor);
  const fillC = hexToRgb(s.fillColor);
  const fillAmt = s.fill / 100;

  // Wave — deterministic wobble of the sampling coordinates.
  const waveAmp = (s.wave / 100) * Math.max(1.5, w * 0.012);
  const freq = (s.waveFrequency / 100) * 1.4 + 0.02;

  const [oc, octx] = getOut(w, h);
  const out = octx.createImageData(w, h);
  const od = out.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = x;
      let sy = y;
      if (waveAmp > 0) {
        sx = x + Math.sin(y * freq) * waveAmp;
        sy = y + Math.cos(x * freq) * waveAmp;
      }
      const lx = Math.min(w - 1, Math.max(0, Math.round(sx)));
      const ly = Math.min(h - 1, Math.max(0, Math.round(sy)));
      const li = ly * w + lx;

      const e = edgeD[li];
      const shade = (1 - gray[li]) * fillAmt; // darker areas -> more fill

      // Base = background, then faint tonal fill, then lines on top.
      let r = mix(bg.r, fillC.r, shade);
      let g = mix(bg.g, fillC.g, shade);
      let b = mix(bg.b, fillC.b, shade);
      r = mix(r, line.r, e);
      g = mix(g, line.g, e);
      b = mix(b, line.b, e);

      const o = (y * w + x) * 4;
      od[o] = r;
      od[o + 1] = g;
      od[o + 2] = b;
      od[o + 3] = 255;
    }
  }

  octx.putImageData(out, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(dx, dy, dw, dh);
  ctx.drawImage(oc, 0, 0, w, h, dx, dy, dw, dh);
  ctx.restore();
}
