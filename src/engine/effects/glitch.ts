import type { GlitchSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Glitch — digital / VHS / signal-break style.                       */
/*  Canvas 2D. The image is resampled per-row with RGB channel shift,   */
/*  smooth distortion + random tearing bands, then noise, grain and     */
/*  scanlines are layered in. Animated when settings.animation is on.  */
/* ------------------------------------------------------------------ */

let work: HTMLCanvasElement | null = null;
let workCtx: CanvasRenderingContext2D | null = null;

function getWork(w: number, h: number): CanvasRenderingContext2D {
  if (!work) {
    work = document.createElement("canvas");
    workCtx = work.getContext("2d", { willReadFrequently: true });
  }
  if (work.width !== w || work.height !== h) {
    work.width = w;
    work.height = h;
  }
  return workCtx!;
}

/** Small deterministic PRNG so bands are stable within a frame. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function renderGlitch(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: FitRect,
  s: GlitchSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;

  // Working resolution (capped — this runs per animation frame).
  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(dw, dh));
  const w = Math.max(1, Math.round(dw * scale));
  const h = Math.max(1, Math.round(dh * scale));

  const wctx = getWork(w, h);
  wctx.clearRect(0, 0, w, h);
  wctx.drawImage(image, 0, 0, w, h);
  const src = wctx.getImageData(0, 0, w, h);
  const sd = src.data;
  const out = wctx.createImageData(w, h);
  const od = out.data;

  // Parameter scaling.
  const rgbOff = Math.round((s.rgbShift / 100) * w * 0.03);
  const distAmp = (s.distortion / 100) * w * 0.05;
  const distFreq = 0.035;
  const phase = s.animation ? time * 0.004 : 0;
  const noiseAmp = (s.noise / 100) * 90;
  const grainAmp = (s.grain / 100) * 45;
  const scanStrength = (s.scanlines / 100) * 0.6;

  // Per-row horizontal offset: smooth distortion + random tearing bands.
  const rowOff = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    rowOff[y] = Math.sin(y * distFreq + phase) * distAmp;
  }
  const bandCount = Math.round((s.glitches / 100) * 9);
  if (bandCount > 0) {
    // Reseed periodically so bands jump when animating; stable otherwise.
    const tick = s.animation ? Math.floor(time / 90) : 1;
    const rnd = mulberry32(tick * 2654435761);
    for (let b = 0; b < bandCount; b++) {
      const by = Math.floor(rnd() * h);
      const bh = Math.max(2, Math.floor(rnd() * h * 0.09));
      const shift = Math.round((rnd() - 0.5) * w * 0.18);
      for (let y = by; y < Math.min(h, by + bh); y++) rowOff[y] += shift;
    }
  }

  const clampX = (x: number) => (x < 0 ? 0 : x >= w ? w - 1 : x);

  for (let y = 0; y < h; y++) {
    const off = Math.round(rowOff[y]);
    const rowBase = y * w;
    const scan = y & 1 ? 1 - scanStrength : 1;
    for (let x = 0; x < w; x++) {
      const xr = clampX(x - off - rgbOff);
      const xg = clampX(x - off);
      const xb = clampX(x - off + rgbOff);

      let r = sd[(rowBase + xr) * 4];
      let g = sd[(rowBase + xg) * 4 + 1];
      let b = sd[(rowBase + xb) * 4 + 2];
      const a = sd[(rowBase + xg) * 4 + 3];

      if (noiseAmp > 0) {
        const n = (Math.random() - 0.5) * noiseAmp;
        r += n;
        g += n;
        b += n;
      }
      if (grainAmp > 0) {
        r += (Math.random() - 0.5) * grainAmp;
        g += (Math.random() - 0.5) * grainAmp;
        b += (Math.random() - 0.5) * grainAmp;
      }
      if (scan !== 1) {
        r *= scan;
        g *= scan;
        b *= scan;
      }

      const o = (rowBase + x) * 4;
      od[o] = r;
      od[o + 1] = g;
      od[o + 2] = b;
      od[o + 3] = a;
    }
  }

  wctx.putImageData(out, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(dx, dy, dw, dh);
  ctx.drawImage(work!, 0, 0, w, h, dx, dy, dw, dh);
  ctx.restore();
}
