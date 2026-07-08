import type { FluxMeltSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  Flux Melt — premium directional melt / flow-blur / displacement.   */
/*  Works on the real image/video frame. Each output pixel walks a      */
/*  spatially-varying flow field (directional + wind + radial pull +    */
/*  turbulence) and accumulates weighted taps back along that flow —    */
/*  a per-pixel directional blur that reads as a smooth liquid smear.   */
/*  Processed at a reduced internal resolution, then scaled up cleanly. */
/* ------------------------------------------------------------------ */

export function renderFluxMelt(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: FluxMeltSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  // Higher Smoothness → higher internal resolution (still capped for perf).
  const maxDim = 360 + (s.smoothness / 100) * 320;
  const sc = Math.min(1, maxDim / Math.max(dw, dh));
  const w = Math.max(8, Math.round(dw * sc));
  const h = Math.max(8, Math.round(dh * sc));

  const src = getBuffer("flux-src", w, h, true);
  src.clearRect(0, 0, w, h);
  src.drawImage(input, 0, 0, w, h);
  const sd = src.getImageData(0, 0, w, h).data;

  const outBuf = getBuffer("flux-out", w, h);
  const out = outBuf.createImageData(w, h);
  const od = out.data;

  const cx = (s.centerX / 100) * w;
  const cy = (s.centerY / 100) * h;
  const asp = Math.max(0.2, s.aspect / 100);
  const rot = (s.rotation * Math.PI) / 180;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const influence = Math.max(1, Math.min(w, h) * 0.5 * (0.25 + (s.size / 100) * 1.2));
  const falPow = 0.4 + (s.falloff / 100) * 3.5;

  const dirA = (s.direction * Math.PI) / 180;
  const windA = (s.windDirection * Math.PI) / 180;
  const flowLen = (s.flowAmount / 100) * w * 0.16;
  const windLen = (s.windStrength / 100) * w * 0.12;
  const windX = Math.cos(windA) * windLen;
  const windY = Math.sin(windA) * windLen;
  const dirX = Math.cos(dirA);
  const dirY = Math.sin(dirA);
  const turbAmp = (s.turbulenceAmount / 100) * w * 0.06;
  const turbFreq = 1.5 + (s.turbulenceScale / 100) * 9;
  const stretchF = 1 + (s.stretch / 100) * 2.2;
  const scatterAmp = (s.scatter / 100) * w * 0.04;
  const taps = 3 + Math.round((s.diffusion / 100) * 12);
  const t = time * 0.001;
  const inwardSign = s.inward ? -1 : 1;

  // Cheap value hash for scatter/grain jitter (deterministic per pixel).
  const hash = (n: number) => {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Bilinear sample of the source buffer.
  const sample = (x: number, y: number, o: number[]) => {
    const xi = clamp(x, 0, w - 1.001);
    const yi = clamp(y, 0, h - 1.001);
    const x0 = xi | 0;
    const y0 = yi | 0;
    const fx = xi - x0;
    const fy = yi - y0;
    const i00 = (y0 * w + x0) * 4;
    const i10 = i00 + 4;
    const i01 = i00 + w * 4;
    const i11 = i01 + 4;
    for (let c = 0; c < 3; c++) {
      const a = sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx;
      const b = sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx;
      o[c] = a * (1 - fy) + b * fy;
    }
  };

  const tmp = [0, 0, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x - cx;
      const py = y - cy;
      // Rotate + aspect into effect space for the falloff mask.
      const ex = (px * cosR + py * sinR) / asp;
      const ey = -px * sinR + py * cosR;
      const dist = Math.hypot(ex, ey) / influence;
      const fall = Math.pow(clamp(1 - dist, 0, 1), falPow);

      // Radial unit (pull toward / away from the center).
      const rlen = Math.hypot(px, py) || 1;
      const rux = px / rlen;
      const ruy = py / rlen;

      // Turbulence (animated, domain-warped).
      const nu = x / w;
      const nv = y / h;
      const turbX =
        (Math.sin(nu * turbFreq + t) + Math.cos(nv * turbFreq * 1.3 - t * 0.8)) * turbAmp;
      const turbY =
        (Math.cos(nu * turbFreq * 1.1 - t * 1.1) + Math.sin(nv * turbFreq * 0.9 + t)) * turbAmp;

      // Compose the flow vector, weighted by the center falloff.
      let vX = (dirX * flowLen + windX + rux * flowLen * inwardSign * 0.8 + turbX) * stretchF * fall;
      let vY = (dirY * flowLen + windY + ruy * flowLen * inwardSign * 0.8 + turbY) * stretchF * fall;
      if (scatterAmp > 0) {
        vX += (hash(x * 7.1 + y) - 0.5) * scatterAmp;
        vY += (hash(x + y * 7.7) - 0.5) * scatterAmp;
      }

      // Accumulate weighted taps back along the flow (directional smear).
      let r = 0;
      let g = 0;
      let b = 0;
      let wsum = 0;
      let hr = 0;
      let hg = 0;
      let hb = 0;
      let hl = -1;
      for (let i = 0; i < taps; i++) {
        const f = taps > 1 ? i / (taps - 1) : 0;
        sample(x - vX * f, y - vY * f, tmp);
        const wgt = 1 - f * (0.3 + (s.edgeSoftness / 100) * 0.6);
        r += tmp[0] * wgt;
        g += tmp[1] * wgt;
        b += tmp[2] * wgt;
        wsum += wgt;
        if (s.preserveHighlights) {
          const l = tmp[0] * 0.299 + tmp[1] * 0.587 + tmp[2] * 0.114;
          if (l > hl) {
            hl = l;
            hr = tmp[0];
            hg = tmp[1];
            hb = tmp[2];
          }
        }
      }
      let mr = r / wsum;
      let mg = g / wsum;
      let mb = b / wsum;

      // Preserve structure: mix a little of the exact source pixel back.
      if (s.preserve) {
        const j = (y * w + x) * 4;
        const k = 0.35;
        mr = mr * (1 - k) + sd[j] * k;
        mg = mg * (1 - k) + sd[j + 1] * k;
        mb = mb * (1 - k) + sd[j + 2] * k;
      }
      // Preserve highlights: lift toward the brightest tap.
      if (s.preserveHighlights && hl >= 0) {
        const k = 0.5;
        mr = Math.max(mr, mr * (1 - k) + hr * k);
        mg = Math.max(mg, mg * (1 - k) + hg * k);
        mb = Math.max(mb, mb * (1 - k) + hb * k);
      }
      // Grain.
      if (s.grain > 0) {
        const gn = (hash(x * 3.3 + y * 9.1 + t) - 0.5) * (s.grain / 100) * 60;
        mr += gn;
        mg += gn;
        mb += gn;
      }

      const o = (y * w + x) * 4;
      od[o] = clamp(mr, 0, 255);
      od[o + 1] = clamp(mg, 0, 255);
      od[o + 2] = clamp(mb, 0, 255);
      od[o + 3] = 255;
    }
  }
  outBuf.putImageData(out, 0, 0);

  // Composite over the fitted region: melted result, optional original blend,
  // scaled up with smoothing for a clean output; opacity blends toward base.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = clamp(s.opacity / 100, 0, 1);
  ctx.drawImage(outBuf.canvas, 0, 0, w, h, dx, dy, dw, dh);
  if (s.blendOriginal > 0) {
    ctx.globalAlpha = clamp(s.opacity / 100, 0, 1) * (s.blendOriginal / 100);
    ctx.drawImage(input, dx, dy, dw, dh);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
