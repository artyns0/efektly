import type { NightVisionSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, fxScale, getBuffer, rand } from "./fxUtils";
import { getFrameContext } from "./temporalContext";

/* ------------------------------------------------------------------ */
/*  Night Vision — luminance-driven NVG / thermal-amber shader.        */
/*                                                                     */
/*  Grayscale + gain/contrast crush → phosphor tint (green or amber) → */
/*  soft phosphor glow → sensor noise → scanlines → circular vignette.  */
/*  Noise is seeded from the media time so it drifts in preview yet is   */
/*  fully deterministic (identical) at export.                         */
/* ------------------------------------------------------------------ */

const TINT: Record<string, string> = {
  green: "#37ff6a",
  amber: "#ffb43a",
};

export function renderNightVision(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: NightVisionSettings,
  time: number,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));
  const sc = fxScale(dw, dh);

  // 1 — grayscale with gain + contrast crush.
  const gain = 60 + (s.gain / 100) * 150;
  const crush = 100 + (s.contrast / 100) * 170;
  const b = getBuffer("nv-base", w, h);
  b.clearRect(0, 0, w, h);
  b.filter = `grayscale(1) brightness(${gain}%) contrast(${crush}%)`;
  b.drawImage(input, 0, 0, w, h);
  b.filter = "none";

  // 2 — phosphor tint (multiply keeps highlights coloured, blacks dark).
  b.globalCompositeOperation = "multiply";
  b.fillStyle = TINT[s.colorMode] ?? TINT.green;
  b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.fillStyle = "#000";
  ctx.fillRect(dx, dy, dw, dh);
  ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);

  // 3 — phosphor glow (blurred bright pass, additive).
  if (s.glow > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (s.glow / 100) * 0.5;
    ctx.filter = `blur(${Math.max(2, 6 * sc)}px)`;
    ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // 4 — sensor noise (deterministic per media frame).
  if (s.noise > 0) {
    const nc = Math.max(1, Math.round(4 * sc));
    const nw = Math.max(1, Math.round(w / nc));
    const nh = Math.max(1, Math.round(h / nc));
    const n = getBuffer("nv-noise", nw, nh);
    const img = n.createImageData(nw, nh);
    const mt = getFrameContext().mediaTimeMs;
    const seedBase = Math.floor((mt || time) / 55); // ~18 fps noise churn
    for (let i = 0; i < nw * nh; i++) {
      const v = (rand(i * 12.9898 + seedBase * 78.233) * 255) | 0;
      const j = i * 4;
      img.data[j] = img.data[j + 1] = img.data[j + 2] = v;
      img.data[j + 3] = 255;
    }
    n.putImageData(img, 0, 0);
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = (s.noise / 100) * 0.35;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(n.canvas, 0, 0, nw, nh, dx, dy, dw, dh);
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // 5 — scanlines.
  if (s.scanlineIntensity > 0 && s.scanlineDensity > 0) {
    const period = Math.max(2, Math.round((6 - (s.scanlineDensity / 100) * 4) * sc));
    const thick = Math.max(1, Math.round(period / 3));
    ctx.fillStyle = `rgba(0,0,0,${(s.scanlineIntensity / 100) * 0.5})`;
    for (let y = 0; y < h; y += period) ctx.fillRect(dx, dy + y, dw, thick);
  }

  // 6 — circular vignette.
  if (s.vignette > 0) {
    const cx = dx + dw / 2;
    const cy = dy + dh / 2;
    const g = ctx.createRadialGradient(
      cx, cy, Math.min(dw, dh) * 0.28,
      cx, cy, Math.max(dw, dh) * 0.72,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${clamp(s.vignette / 100, 0, 1) * 0.92})`);
    ctx.fillStyle = g;
    ctx.fillRect(dx, dy, dw, dh);
  }

  ctx.restore();
}
