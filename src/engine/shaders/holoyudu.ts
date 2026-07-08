import type { HoloyuduSettings } from "../../types/shaders";
import { hexToRgb, mixRgb } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Holoyudu — procedural holographic / iridescent interference.       */
/*  A domain-warped flow field drives thin-film interference bands      */
/*  coloured by a spectral A/B/C palette, with a moving specular        */
/*  highlight and grain. The internal buffer resolution tracks the       */
/*  canvas' real device-pixel size (capped for performance) so it stays  */
/*  crisp on large / high-DPI previews instead of being upscaled from a  */
/*  tiny fixed buffer.                                                   */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
// Per-frame pixel budget for the procedural field (kept smooth at ~60fps
// while still resolving fine bands on 4K / retina previews).
const MAX_PIXELS = 720_000;

let buf: HTMLCanvasElement | null = null;
let bctx: CanvasRenderingContext2D | null = null;

function getBuf(w: number, h: number): CanvasRenderingContext2D {
  if (!buf) {
    buf = document.createElement("canvas");
    bctx = buf.getContext("2d", { willReadFrequently: true });
  }
  if (buf.width !== w || buf.height !== h) {
    buf.width = w;
    buf.height = h;
  }
  return bctx!;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Cheap value noise (smooth) from a hashed lattice.
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

export function renderHoloyudu(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: HoloyuduSettings,
  timeSec: number,
): void {
  // Match the real device-pixel resolution of the canvas (respects DPR),
  // scaled down only if it exceeds the per-frame pixel budget.
  const devW = Math.max(1, ctx.canvas.width);
  const devH = Math.max(1, ctx.canvas.height);
  const k = Math.min(1, Math.sqrt(MAX_PIXELS / (devW * devH)));
  const bw = Math.max(2, Math.round(devW * k));
  const bh = Math.max(2, Math.round(devH * k));
  const b = getBuf(bw, bh);
  const img = b.createImageData(bw, bh);
  const d = img.data;

  const a = hexToRgb(s.colorA);
  const bc = hexToRgb(s.colorB);
  const cc = hexToRgb(s.colorC);
  const bg = hexToRgb(s.background);
  const count = Math.max(1, Math.min(3, Math.round(s.colorCount)));

  const t = timeSec * (0.3 + s.flowSpeed);
  const flowA = (s.flowAngle * Math.PI) / 180;
  const fdx = Math.cos(flowA);
  const fdy = Math.sin(flowA);
  const flowStr = s.flowStrength / 100;
  const flowDens = 1 + (s.flowDensity / 100) * 5;
  const fluid = (s.fluidMap / 100) * 1.4;
  const dist = (s.distortion / 100) * 1.2;
  const noiseAmt = s.noise / 100;
  const bandDens = 4 + (s.bandDensity / 100) * 40;
  const interfScale = 0.5 + (s.interferenceScale / 100) * 4;
  const bandSoft = 0.15 + (s.bandSoftness / 100) * 0.85;
  const hueShift = s.hueShift / 100;
  const sat = s.saturation / 100;
  const blend = s.blendAmount / 100;
  const hiA = (s.highlightAngle * Math.PI) / 180;
  const hiDX = Math.cos(hiA);
  const hiDY = Math.sin(hiA);
  const hiStr = s.highlightStrength / 100;
  const hiW = 0.05 + (s.highlightWidth / 100) * 0.6;
  const hiSoft = 0.1 + (s.highlightSoftness / 100) * 0.9;
  const gloss = s.gloss / 100;
  const lumInf = s.luminanceInfluence / 100;
  const edgeInf = s.edgeInfluence / 100;
  const texInf = s.textureInfluence / 100;
  const opacity = clamp(s.opacity / 100, 0, 1);

  // Spectral palette across the chosen colour count.
  const palette = (p: number) => {
    const q = ((p % 1) + 1) % 1;
    if (count === 1) return mixRgb(bg, a, 0.4 + 0.6 * q);
    if (count === 2) return mixRgb(a, bc, q < 0.5 ? q * 2 : (1 - q) * 2);
    // 3 colours around the wheel
    if (q < 1 / 3) return mixRgb(a, bc, q * 3);
    if (q < 2 / 3) return mixRgb(bc, cc, (q - 1 / 3) * 3);
    return mixRgb(cc, a, (q - 2 / 3) * 3);
  };

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const u = x / bw;
      const v = y / bh;

      // Domain-warped flow coordinate (fluid map feel).
      const warp =
        Math.sin((u * flowDens + t * 0.3) * TAU) * fluid +
        Math.cos((v * flowDens - t * 0.24) * TAU) * fluid;
      const nz = noiseAmt > 0 ? (vnoise(u * 6 + t, v * 6 - t) - 0.5) * 2 : 0;
      const fx = u + (fdx * flowStr + warp * dist + nz * noiseAmt) * 0.35;
      const fy = v + (fdy * flowStr - warp * dist * 0.7) * 0.35;

      // Interference phase → spectral band position.
      let phase =
        Math.sin((fx * interfScale + fy * interfScale * 0.6) * TAU * 0.5 + t * 0.6) * 0.5 +
        0.5;
      phase = phase + fx * bandDens * 0.02 + fy * bandDens * 0.013;
      // Band shaping (soft repeating stripes).
      const band = Math.pow(
        0.5 + 0.5 * Math.cos(phase * TAU * (bandDens / 6)),
        1 / bandSoft,
      );

      // Edge influence from the flow-field gradient.
      const edge =
        Math.abs(Math.sin((fx - fy) * bandDens * 0.5 + t)) * edgeInf;

      let col = palette(phase * 1.2 + hueShift + edge * 0.3);
      // Saturation control (mix toward its own luminance).
      const l = (col.r * 0.299 + col.g * 0.587 + col.b * 0.114);
      col = {
        r: l + (col.r - l) * (0.3 + sat),
        g: l + (col.g - l) * (0.3 + sat),
        b: l + (col.b - l) * (0.3 + sat),
      };

      // Moving specular highlight band.
      const proj = fx * hiDX + fy * hiDY + Math.sin(t * 0.5) * 0.3;
      const hb = ((proj % 1) + 1) % 1;
      const hd = Math.min(Math.abs(hb - 0.5), 1 - Math.abs(hb - 0.5));
      const highlight =
        hiStr * Math.pow(clamp(1 - hd / hiW, 0, 1), 1 + hiSoft * 3) * (0.6 + gloss);

      // Luminance / texture modulation.
      const tex = texInf > 0 ? (vnoise(u * 40, v * 40) - 0.5) * texInf * 40 : 0;
      const lumMod = 1 - lumInf * 0.4 + lumInf * band * 0.8;

      let r = col.r * band * lumMod + highlight * 255 + tex;
      let g = col.g * band * lumMod + highlight * 255 + tex;
      let bl = col.b * band * lumMod + highlight * 255 + tex;

      // Blend over the background; preserve dark keeps low-energy areas dark.
      const energy = clamp(band * (0.5 + lumMod * 0.5), 0, 1);
      const bgMix = s.preserveDark ? 1 - energy : 1 - blend;
      r = r * (1 - bgMix) + bg.r * bgMix;
      g = g * (1 - bgMix) + bg.g * bgMix;
      bl = bl * (1 - bgMix) + bg.b * bgMix;

      const o = (y * bw + x) * 4;
      d[o] = clamp(r, 0, 255);
      d[o + 1] = clamp(g, 0, 255);
      d[o + 2] = clamp(bl, 0, 255);
      d[o + 3] = 255;
    }
  }
  b.putImageData(img, 0, 0);

  // Background fill + smooth upscale of the iridescent field.
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(buf!, 0, 0, bw, bh, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.restore();
}
