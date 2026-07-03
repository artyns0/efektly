import type { ReflectionGridSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Reflection Grid — mirrored, tiled, kaleidoscopic reflection.       */
/*  Canvas 2D. A square sample is taken around the source center,      */
/*  rotated, then tiled across a grid with alternating mirror flips.   */
/*  Softness / glow / contrast / hue-shift / color mode are applied as  */
/*  a filtered composite; light noise adds texture.                    */
/* ------------------------------------------------------------------ */

const ONYX = "#131313";

// Reusable offscreen canvases.
let tile: HTMLCanvasElement | null = null;
let tileCtx: CanvasRenderingContext2D | null = null;
let work: HTMLCanvasElement | null = null;
let workCtx: CanvasRenderingContext2D | null = null;
let noiseCanvas: HTMLCanvasElement | null = null;
let noiseCtx: CanvasRenderingContext2D | null = null;

function ensure(
  ref: HTMLCanvasElement | null,
  w: number,
  h: number,
): HTMLCanvasElement {
  const c = ref ?? document.createElement("canvas");
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

function colorFilter(s: ReflectionGridSettings): string {
  const parts: string[] = [];
  if (s.softness > 0) parts.push(`blur(${(s.softness / 100) * 6}px)`);
  parts.push(`contrast(${clamp(100 + s.contrast, 10, 300)}%)`);
  if (s.invert) parts.push("invert(1)");
  if (s.colorShift > 0) parts.push(`hue-rotate(${s.colorShift}deg)`);
  if (s.colorMode === "mono") parts.push("grayscale(1)");
  if (s.colorMode === "brand") {
    // Warm duotone approximating Onyx -> Tiger Flame -> Soft Linen.
    parts.push("grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg) brightness(1.05)");
  }
  return parts.join(" ");
}

export function renderReflectionGrid(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: ReflectionGridSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));

  const iw = (input as HTMLCanvasElement).width || w;
  const ih = (input as HTMLCanvasElement).height || h;

  /* --- 1. build the sampled + rotated tile --- */
  const tileRes = 256;
  tile = ensure(tile, tileRes, tileRes);
  tileCtx = tile.getContext("2d")!;
  tileCtx.clearRect(0, 0, tileRes, tileRes);

  const regionFrac = clamp(0.15 + (s.cellSize / 100) * 0.7, 0.1, 1);
  const region = clamp(
    (Math.min(iw, ih) * regionFrac) / clamp(s.scale, 0.25, 4),
    8,
    Math.min(iw, ih),
  );
  const cx = clamp(s.centerX, 0, 1) * iw;
  const cy = clamp(s.centerY, 0, 1) * ih;
  const sx = clamp(cx - region / 2, 0, Math.max(0, iw - region));
  const sy = clamp(cy - region / 2, 0, Math.max(0, ih - region));

  tileCtx.save();
  tileCtx.translate(tileRes / 2, tileRes / 2);
  tileCtx.rotate((s.rotation * Math.PI) / 180);
  const cover = tileRes * 1.5; // overdraw so rotation leaves no gaps
  tileCtx.imageSmoothingEnabled = true;
  tileCtx.drawImage(input, sx, sy, region, region, -cover / 2, -cover / 2, cover, cover);
  tileCtx.restore();

  /* --- 2. tile across the grid, blending plain + mirrored --- */
  work = ensure(work, w, h);
  workCtx = work.getContext("2d")!;
  const wctx = workCtx;
  wctx.globalAlpha = 1;
  wctx.fillStyle = ONYX;
  wctx.fillRect(0, 0, w, h);

  const grid = clamp(Math.round(s.repeatCount), 1, 12);
  const cw = w / grid;
  const ch = h / grid;

  const drawTiling = (mirror: boolean) => {
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        wctx.save();
        wctx.translate((gx + 0.5) * cw, (gy + 0.5) * ch);
        if (mirror) wctx.scale(gx % 2 ? -1 : 1, gy % 2 ? -1 : 1);
        wctx.drawImage(tile!, -cw / 2 - 0.5, -ch / 2 - 0.5, cw + 1, ch + 1);
        wctx.restore();
      }
    }
  };

  drawTiling(false);
  if (s.mirrorAmount > 0) {
    wctx.globalAlpha = s.mirrorAmount / 100;
    drawTiling(true);
    wctx.globalAlpha = 1;
  }

  /* --- 3. composite to the target with color/softness filters --- */
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.clearRect(dx, dy, dw, dh);

  ctx.filter = colorFilter(s);
  ctx.drawImage(work, 0, 0, w, h, dx, dy, dw, dh);

  // Glow / bloom pass.
  if (s.glow > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (s.glow / 100) * 0.6;
    ctx.filter = `blur(${8 + (s.glow / 100) * 22}px) ${colorFilter(s)}`;
    ctx.drawImage(work, 0, 0, w, h, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.filter = "none";

  // Noise overlay.
  if (s.noise > 0) {
    const nw = Math.max(1, Math.round(w / 3));
    const nh = Math.max(1, Math.round(h / 3));
    noiseCanvas = ensure(noiseCanvas, nw, nh);
    noiseCtx = noiseCanvas.getContext("2d")!;
    const img = noiseCtx.createImageData(nw, nh);
    const d = img.data;
    for (let i = 0; i < nw * nh; i++) {
      const v = (Math.random() * 255) | 0;
      d[i * 4] = v;
      d[i * 4 + 1] = v;
      d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
    noiseCtx.putImageData(img, 0, 0);
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = (s.noise / 100) * 0.35;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(noiseCanvas, 0, 0, nw, nh, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}
