import type { AuraOrbSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Aura Orb — a glowing procedural energy orb on a dark background.    */
/*  The luminous core (plasma flow + inner bands + rim) is rendered on  */
/*  a fixed-size offscreen buffer per frame, then scaled up smoothly    */
/*  so it stays crisp at any preview size. A radial aura gradient and a  */
/*  blurred additive bloom pass wrap it in soft light. Loop-friendly.   */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const N = 220; // orb buffer resolution (scaled up smoothly to fill the orb)

let orbCanvas: HTMLCanvasElement | null = null;
let orbCtx: CanvasRenderingContext2D | null = null;

function getOrbCtx(): CanvasRenderingContext2D {
  if (!orbCanvas) {
    orbCanvas = document.createElement("canvas");
    orbCanvas.width = N;
    orbCanvas.height = N;
    orbCtx = orbCanvas.getContext("2d", { willReadFrequently: true });
  }
  return orbCtx!;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0 || 1e-5), 0, 1);
  return t * t * (3 - 2 * t);
};

export function renderAuraOrb(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: AuraOrbSettings,
  timeSec: number,
): void {
  const loop = Math.max(0.5, s.loopDuration);
  // Loop-friendly angular time.
  const t = timeSec * s.speed * (TAU / loop);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const hi = hexToRgb(s.highlightColor);
  const rim = hexToRgb(s.rimColor);

  // ---- 1. build the orb core on the offscreen buffer ----
  const octx = getOrbCtx();
  const img = octx.createImageData(N, N);
  const d = img.data;

  const rot = (s.rotation * Math.PI) / 180;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const p = 2 + (1 - s.roundness / 100) * 6; // superellipse exponent
  const fs = 1.5 + (s.flowScale / 100) * 6;
  const fspd = 0.4 + s.flowSpeed;
  const dist = s.flowDistortion / 100;
  const band = (s.innerBand / 100) * 26;
  const plasma = (s.plasma / 100) * 3;
  const noiseAmt = (s.noise / 100) * 0.5;
  const shift = (s.colorShift / 100 - 0.5) * 1.4;
  const rimW = 0.04 + (s.rimWidth / 100) * 0.4;
  const soft = 0.02 + (s.edgeSoftness / 100) * 0.35;

  for (let y = 0; y < N; y++) {
    const ny = (y / (N - 1)) * 2 - 1;
    for (let x = 0; x < N; x++) {
      const nx = (x / (N - 1)) * 2 - 1;
      const rx = nx * cosR - ny * sinR;
      const ry = nx * sinR + ny * cosR;
      const rr = Math.pow(
        Math.pow(Math.abs(rx), p) + Math.pow(Math.abs(ry), p),
        1 / p,
      );
      const i = (y * N + x) * 4;
      if (rr > 1.02) {
        d[i + 3] = 0;
        continue;
      }

      // plasma / flow field
      let v =
        Math.sin(rx * fs + t * fspd) +
        Math.sin(ry * fs * 1.3 - t * fspd * 0.8) +
        Math.sin((rx + ry) * fs * 0.7 + t) +
        dist * Math.sin(rr * 6 - t * 2);
      v /= 3 + dist;
      // grain
      if (noiseAmt > 0) {
        v += (Math.sin((x * 12.9898 + y * 78.233 + t) * 43758.5453) % 1) * noiseAmt;
      }

      // inner light bands travelling outward
      const bands = 0.5 + 0.5 * Math.sin(rr * band - t * 2 + v * plasma);

      // base color
      const mixT = clamp(0.5 + 0.5 * v + shift, 0, 1);
      let col = mixRgb(a, b, mixT);
      // bright inner highlight, strongest at the core
      col = mixRgb(col, hi, bands * (1 - rr) * 0.9);

      // rim
      const rimF = smooth(1 - rimW, 1, rr);
      col = mixRgb(col, rim, rimF);

      // core is brightest, dims outward
      const bright = clamp(1 - rr * 0.55, 0, 1) * (0.7 + bands * 0.5) + rimF * 0.6;

      // soft edge alpha
      const alpha = 1 - smooth(1 - soft, 1.02, rr);

      d[i] = clamp(col.r * bright, 0, 255);
      d[i + 1] = clamp(col.g * bright, 0, 255);
      d[i + 2] = clamp(col.b * bright, 0, 255);
      d[i + 3] = clamp(alpha * 255, 0, 255);
    }
  }
  octx.putImageData(img, 0, 0);

  // ---- 2. compose onto the main canvas ----
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const cx = s.centerX * w;
  const cy = s.centerY * h;
  const pulse = 1 + (s.pulseAmount / 100) * 0.18 * Math.sin(timeSec * s.pulseSpeed * 2);
  const orbR = Math.min(w, h) * 0.5 * (0.2 + (s.radius / 100) * 0.7) * pulse;

  // aura glow — large soft radial gradient
  const glow = s.glowIntensity / 100;
  if (glow > 0) {
    const gR = orbR * (1 + (s.glowRadius / 100) * 2.5);
    const grad = ctx.createRadialGradient(cx, cy, orbR * 0.2, cx, cy, gR);
    const fall = 0.2 + (s.auraFalloff / 100) * 0.6;
    const aura = mixRgb(a, hi, 0.4);
    grad.addColorStop(0, rgba(aura, 0.5 * glow));
    grad.addColorStop(fall, rgba(aura, 0.18 * glow));
    grad.addColorStop(1, rgba(aura, 0));
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }

  // bloom — blurred, additive copy of the orb
  const bloom = s.bloomAmount / 100;
  if (bloom > 0 && orbCanvas) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${2 + (s.bloomRadius / 100) * 26}px)`;
    ctx.globalAlpha = bloom * 0.9;
    ctx.drawImage(orbCanvas, cx - orbR, cy - orbR, orbR * 2, orbR * 2);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // crisp orb core
  if (orbCanvas) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(orbCanvas, cx - orbR, cy - orbR, orbR * 2, orbR * 2);
  }
}
