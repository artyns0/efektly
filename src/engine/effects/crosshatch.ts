import type { CrosshatchSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, fxScale, getBuffer, lum, rand } from "./fxUtils";

/* Crosshatch — luminance-driven hatch shading (Canvas 2D). */

export function renderCrosshatch(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: CrosshatchSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  // Low-res luminance sample.
  const sw = Math.max(1, Math.round(Math.min(dw, 360)));
  const sh = Math.max(1, Math.round((sw * dh) / dw));
  const bctx = getBuffer("xhatch-src", sw, sh, true);
  bctx.clearRect(0, 0, sw, sh);
  bctx.drawImage(input, 0, 0, sw, sh);
  const data = bctx.getImageData(0, 0, sw, sh).data;
  const cf = Math.tan((((s.contrast / 100) + 1) * Math.PI) / 4);
  const lumAt = (x: number, y: number) => {
    const xi = clamp(Math.round((x / dw) * (sw - 1)), 0, sw - 1);
    const yi = clamp(Math.round((y / dh) * (sh - 1)), 0, sh - 1);
    const i = (yi * sw + xi) * 4;
    let v = lum(data[i], data[i + 1], data[i + 2]);
    v = clamp((v - 0.5) * cf + 0.5, 0, 1);
    return s.invert ? 1 - v : v;
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.fillStyle = s.bgColor;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.translate(dx, dy);
  // Hatch metrics live in output-pixel space, so scale them with the render
  // size to keep line spacing/width a constant fraction at any resolution.
  const sc = fxScale(dw, dh);
  ctx.strokeStyle = s.inkColor;
  ctx.lineWidth = Math.max(0.5, s.lineWidth * sc);
  ctx.lineCap = "round";

  const spacing = clamp(26 - (s.lineDensity / 100) * 22, 3, 30) * sc;
  const thr = s.threshold / 100;
  const diag = Math.sqrt(dw * dw + dh * dh);
  const step = Math.max(2, 5 * sc);
  const rough = (s.roughness / 100) * 3 * sc;
  const jit = (s.jitter / 100) * spacing * 0.5;

  // Two hatch passes: angle1 for tones below thr, angle2 for darker tones.
  const passes: [number, number][] = [
    [(s.angle1 * Math.PI) / 180, thr],
    [(s.angle2 * Math.PI) / 180, thr * 0.55],
  ];
  for (let p = 0; p < passes.length; p++) {
    const [ang, cutoff] = passes[p];
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    let li = 0;
    for (let o = -diag; o <= diag; o += spacing) {
      li++;
      const jo = o + (rand(li * 7 + p * 131) - 0.5) * 2 * jit;
      let drawing = false;
      ctx.beginPath();
      for (let t = -diag / 2; t <= diag / 2; t += step) {
        // Line through rect center, offset jo along the normal.
        const x = dw / 2 + cos * t - sin * jo;
        const y = dh / 2 + sin * t + cos * jo;
        if (x < 0 || x > dw || y < 0 || y > dh) {
          drawing = false;
          continue;
        }
        const dark = lumAt(x, y) < cutoff;
        const rx = x + (rand(t + li * 3.3) - 0.5) * rough;
        const ry = y + (rand(t * 1.7 + li) - 0.5) * rough;
        if (dark && !drawing) {
          ctx.moveTo(rx, ry);
          drawing = true;
        } else if (dark) {
          ctx.lineTo(rx, ry);
        } else {
          drawing = false;
        }
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
