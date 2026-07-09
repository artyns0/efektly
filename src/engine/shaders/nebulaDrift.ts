import type { NebulaDriftSettings } from "../../types/shaders";
import { hexToRgb } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Nebula Drift — soft volumetric pastel nebula.                      */
/*  A domain-warped fractal-noise (fbm) density field is coloured with  */
/*  a per-channel spectral palette and blended over depth layers for a  */
/*  dreamy, raymarched-cloud feel. Uses a cheap integer-hash value      */
/*  noise (no per-octave trig) so it stays smooth without freezing.     */
/*  Rendered on a capped internal buffer and upscaled with smoothing.   */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
// Pixel Ratio maps directly to the procedural buffer size (the perf dial):
// low → cheap/soft, high → crisp. The field is smooth so it upscales cleanly.
const MIN_PIXELS = 16_000;
const MAX_PIXELS = 74_000;

let buf: HTMLCanvasElement | null = null;
let bctx: CanvasRenderingContext2D | null = null;
let cachedImg: ImageData | null = null;

function getBuf(w: number, h: number): CanvasRenderingContext2D {
  if (!buf) {
    buf = document.createElement("canvas");
    bctx = buf.getContext("2d", { willReadFrequently: true });
  }
  if (buf.width !== w || buf.height !== h) {
    buf.width = w;
    buf.height = h;
    cachedImg = null;
  }
  return bctx!;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0 || 1e-5), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Integer hash → [0,1) (no trig, cheap + smooth). */
function ihash(x: number, y: number): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
/** Smooth 2D value noise in [0,1]. */
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = ihash(ix, iy);
  const b = ihash(ix + 1, iy);
  const c = ihash(ix, iy + 1);
  const d = ihash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Fractal Brownian motion; `oct` octaves = "Max Iterations". */
function fbm(x: number, y: number, oct: number): number {
  let s = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f);
    norm += amp;
    f *= 2.0;
    amp *= 0.5;
  }
  return s / (norm || 1);
}

export function renderNebulaDrift(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: NebulaDriftSettings,
  timeSec: number,
): void {
  // Buffer size driven by Pixel Ratio (target pixel budget), keeping the
  // canvas aspect. This is the primary performance dial.
  const targetPx = MIN_PIXELS + (s.pixelRatio / 100) * (MAX_PIXELS - MIN_PIXELS);
  const canvasAspect = Math.max(1, ctx.canvas.width) / Math.max(1, ctx.canvas.height);
  const bh = Math.max(2, Math.round(Math.sqrt(targetPx / canvasAspect)));
  const bw = Math.max(2, Math.round(bh * canvasAspect));
  const b = getBuf(bw, bh);
  if (!cachedImg || cachedImg.width !== bw || cachedImg.height !== bh) {
    cachedImg = b.createImageData(bw, bh);
  }
  const img = cachedImg;
  const d = img.data;

  const bg = hexToRgb(s.background);
  const tintA = hexToRgb(s.colorA);
  const tintB = hexToRgb(s.colorB);

  const loopK = s.loop ? s.loopSpeed : 1;
  const t = timeSec * (0.15 + s.evolutionSpeed * 0.35) * loopK;
  const oct = Math.max(2, Math.min(8, Math.round(s.maxIterations)));
  const scale = 1.2 + (s.fractalScale / 100) * 4.5;
  const warpAmt = 0.15 + (s.rayStepSize / 100) * 0.9; // "Ray Step Size" → warp/detail
  const drift = (s.driftStrength / 100) * 0.9;
  const fog = s.fogDensity / 100;
  const radius = 0.35 + (s.cloudRadius / 100) * 0.9;
  const soft = 0.15 + (s.glowSoftness / 100) * 0.9;
  const rPhase = s.redPhase / 100;
  const gPhase = s.greenPhase / 100;
  const bPhase = s.bluePhase / 100;
  const rot = (s.flowRotation * Math.PI) / 180;
  const cosR = Math.cos(rot), sinR = Math.sin(rot);
  const aspect = bw / bh;

  for (let y = 0; y < bh; y++) {
    const ny = (y / bh) * 2 - 1;
    for (let x = 0; x < bw; x++) {
      let nx = ((x / bw) * 2 - 1) * aspect;
      let py = ny;
      // Flow rotation.
      const rx = nx * cosR - py * sinR;
      py = nx * sinR + py * cosR;
      nx = rx;

      // Domain warp (two cheap single-octave noises displace the coords → flow).
      const wx = vnoise(nx * scale * 0.5 + t * 0.15, py * scale * 0.5 - t * 0.1);
      const wy = vnoise(nx * scale * 0.5 - t * 0.12 + 5.2, py * scale * 0.5 + t * 0.09);
      const warp = (warpAmt + drift) * 3;
      const sx = nx * scale + (wx - 0.5) * warp + t * 0.06;
      const sy = py * scale + (wy - 0.5) * warp;

      // Fractal density (fbm gives the layered cloud depth).
      const raw = fbm(sx, sy, oct);
      const rr = Math.sqrt(nx * nx + py * py);
      // Soft radial falloff so the nebula floats; gentle so it still fills.
      const mask = 1 - smoothstep(radius, radius + soft * 1.6, rr) * 0.85;
      // Fuller, soft cloud shaping (keeps ambient glow, not sparse smoke).
      const neb =
        (smoothstep(0.32 - fog * 0.22, 0.86, raw) * 0.8 + raw * 0.2) * mask;

      // Pastel spectral palette (blue → cyan → lavender → pink → gold).
      const hue = raw * 1.25 + rr * 0.35 + wx * 0.15;
      let cr = 0.5 + 0.5 * Math.cos(TAU * (rPhase + hue));
      let cg = 0.5 + 0.5 * Math.cos(TAU * (gPhase + hue + 0.33));
      let cb = 0.5 + 0.5 * Math.cos(TAU * (bPhase + hue + 0.66));
      // Pastel lift toward white for a soft, dreamy tone.
      const pastel = 0.34;
      cr = cr * (1 - pastel) + pastel;
      cg = cg * (1 - pastel) + pastel;
      cb = cb * (1 - pastel) + pastel;
      // Subtle tint from the shared Color A/B controls.
      cr = cr * 0.8 + (tintA.r / 255) * 0.12 + (tintB.r / 255) * 0.08;
      cg = cg * 0.8 + (tintA.g / 255) * 0.12 + (tintB.g / 255) * 0.08;
      cb = cb * 0.8 + (tintA.b / 255) * 0.12 + (tintB.b / 255) * 0.08;

      // Luminous nebula: soft ambient floor + density-driven glow, added over
      // the dark background so clouds emit light (not a flat overlay).
      const lum = (0.18 + neb * 1.15) * (0.55 + soft * 0.7);
      let r = bg.r / 255 + cr * lum;
      let g = bg.g / 255 + cg * lum;
      let bl = bg.b / 255 + cb * lum;

      // Ordered-ish dither to kill 8-bit banding on smooth gradients.
      const dz = (ihash(x, y) - 0.5) * (1.5 / 255);

      const o = (y * bw + x) * 4;
      d[o] = clamp((r + dz) * 255, 0, 255);
      d[o + 1] = clamp((g + dz) * 255, 0, 255);
      d[o + 2] = clamp((bl + dz) * 255, 0, 255);
      d[o + 3] = 255;
    }
  }
  b.putImageData(img, 0, 0);

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = clamp(s.opacity / 100, 0, 1);
  ctx.drawImage(buf!, 0, 0, bw, bh, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.restore();
}
