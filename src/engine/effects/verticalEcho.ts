import type { VerticalEchoSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Vertical Echo — vertical smear / ghost-trail / slit-scan look.     */
/*  Canvas 2D. The frame (optionally luminance-keyed and tinted) is     */
/*  redrawn many times with a growing vertical offset, fading opacity,  */
/*  vertical stretch, blur and horizontal jitter — composited additively */
/*  for glowing streaks. Contrast / invert / noise shape the result.   */
/* ------------------------------------------------------------------ */

const FLAME = "#FF5A1F";

// Reusable offscreen canvases.
let keyC: HTMLCanvasElement | null = null;
let tintC: HTMLCanvasElement | null = null;
let workC: HTMLCanvasElement | null = null;
let noiseC: HTMLCanvasElement | null = null;

function ensure(ref: HTMLCanvasElement | null, w: number, h: number) {
  const c = ref ?? document.createElement("canvas");
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Luminance key: darken pixels below the threshold so only highlights streak. */
function makeKey(
  input: CanvasImageSource,
  w: number,
  h: number,
  threshold: number,
): HTMLCanvasElement {
  keyC = ensure(keyC, w, h);
  const kc = keyC.getContext("2d", { willReadFrequently: true })!;
  kc.clearRect(0, 0, w, h);
  kc.drawImage(input, 0, 0, w, h);
  const img = kc.getImageData(0, 0, w, h);
  const d = img.data;
  const thr = (threshold / 100) * 255;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum < thr) {
      d[i] = d[i + 1] = d[i + 2] = 0;
    }
  }
  kc.putImageData(img, 0, 0);
  return keyC;
}

/** Tint the (already keyed) source per color mode. */
function makeTinted(
  src: CanvasImageSource,
  w: number,
  h: number,
  s: VerticalEchoSettings,
): HTMLCanvasElement {
  tintC = ensure(tintC, w, h);
  const tc = tintC.getContext("2d")!;
  tc.clearRect(0, 0, w, h);
  if (s.colorMode === "original") {
    tc.drawImage(src, 0, 0, w, h);
    return tintC;
  }
  tc.filter = "grayscale(1)";
  tc.drawImage(src, 0, 0, w, h);
  tc.filter = "none";
  tc.globalCompositeOperation = "multiply";
  tc.fillStyle = s.colorMode === "brand" ? FLAME : s.fgColor;
  tc.fillRect(0, 0, w, h);
  tc.globalCompositeOperation = "source-over";
  return tintC;
}

export function renderVerticalEcho(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: VerticalEchoSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));

  const keyed = s.threshold > 0 ? makeKey(input, w, h, s.threshold) : input;
  const tinted = makeTinted(keyed, w, h, s);

  workC = ensure(workC, w, h);
  const wctx = workC.getContext("2d")!;
  wctx.globalCompositeOperation = "source-over";
  wctx.globalAlpha = 1;
  wctx.filter = "none";

  // Background.
  wctx.fillStyle = s.colorMode === "original" ? "#000" : s.bgColor;
  wctx.fillRect(0, 0, w, h);

  // Base frame (recognizable) — real image in Original, tinted otherwise.
  wctx.drawImage(s.colorMode === "original" ? input : tinted, 0, 0, w, h);

  // Additive ghost trails.
  wctx.globalCompositeOperation = "lighter";
  const reps = clamp(Math.round(s.repeatCount), 1, 40);
  const maxOff = h * (s.echoLength / 100);
  const dirs =
    s.direction === "both" ? [-1, 1] : s.direction === "up" ? [-1] : [1];

  for (const dir of dirs) {
    for (let i = 1; i <= reps; i++) {
      const f = i / reps;
      const alpha = (1 - (s.opacityFade / 100) * f) * (1 / dirs.length) * 0.85;
      if (alpha <= 0.01) continue;
      const off = dir * maxOff * f;
      const stretchY = 1 + (s.stretchAmount / 100) * 1.4 * f;
      const jitter = s.offsetJitter > 0
        ? (Math.random() - 0.5) * (s.offsetJitter / 100) * w * 0.06
        : 0;

      wctx.globalAlpha = alpha;
      wctx.filter = s.blur > 0 ? `blur(${(s.blur / 100) * 5 * f}px)` : "none";
      wctx.save();
      wctx.translate(jitter, off);
      wctx.translate(0, h / 2);
      wctx.scale(1, stretchY);
      wctx.translate(0, -h / 2);
      wctx.drawImage(tinted, 0, 0, w, h);
      wctx.restore();
    }
  }

  // Accent sheen on the brightest streaks.
  wctx.filter = "none";
  wctx.globalAlpha = 0.25;
  wctx.globalCompositeOperation = "screen";
  wctx.fillStyle = s.accentColor;
  // Mask the accent by the tinted brightness via a temporary "source-in" is
  // costly; instead screen the tinted through accent for a subtle tint.
  wctx.drawImage(tinted, 0, 0, w, h);
  wctx.globalCompositeOperation = "source-over";
  wctx.globalAlpha = 1;

  // Background fade wash.
  if (s.backgroundFade > 0) {
    wctx.globalAlpha = (s.backgroundFade / 100) * 0.6;
    wctx.fillStyle = s.colorMode === "original" ? "#000" : s.bgColor;
    wctx.fillRect(0, 0, w, h);
    wctx.globalAlpha = 1;
  }

  /* --- composite to target with contrast / invert --- */
  const parts: string[] = [];
  parts.push(`contrast(${clamp(100 + s.contrast, 10, 300)}%)`);
  if (s.invert) parts.push("invert(1)");

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.clearRect(dx, dy, dw, dh);
  ctx.filter = parts.join(" ");
  ctx.drawImage(workC, 0, 0, w, h, dx, dy, dw, dh);
  ctx.filter = "none";

  // Noise overlay.
  if (s.noise > 0) {
    const nw = Math.max(1, Math.round(w / 3));
    const nh = Math.max(1, Math.round(h / 3));
    noiseC = ensure(noiseC, nw, nh);
    const nc = noiseC.getContext("2d")!;
    const img = nc.createImageData(nw, nh);
    const d = img.data;
    for (let i = 0; i < nw * nh; i++) {
      const v = (Math.random() * 255) | 0;
      d[i * 4] = v;
      d[i * 4 + 1] = v;
      d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
    nc.putImageData(img, 0, 0);
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = (s.noise / 100) * 0.35;
    ctx.drawImage(noiseC, 0, 0, nw, nh, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}
