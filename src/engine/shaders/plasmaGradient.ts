import type { PlasmaGradientSettings } from "../../types/shaders";
import { hexToRgb, mixRgb } from "./shaderUtils";

/* Plasma Gradient — classic low-res plasma mapped to a 3-color ramp. */

let buf: HTMLCanvasElement | null = null;

export function renderPlasmaGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: PlasmaGradientSettings,
  t: number,
): void {
  const time = t * s.speed;
  const bw = Math.max(2, Math.round(w / 7));
  const bh = Math.max(2, Math.round(h / 7));
  if (!buf) buf = document.createElement("canvas");
  if (buf.width !== bw || buf.height !== bh) {
    buf.width = bw;
    buf.height = bh;
  }
  const bctx = buf.getContext("2d")!;
  const img = bctx.createImageData(bw, bh);
  const d = img.data;

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const c = hexToRgb(s.colorC);
  const bg = hexToRgb(s.background);
  const sc = (0.5 + (s.scale / 100) * 2.5) * 0.12;
  const cf = 1 + (s.contrast / 100) * 2;
  const inten = s.intensity / 100;

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      let v =
        Math.sin(x * sc * 2 + time) +
        Math.sin(y * sc * 1.6 - time * 0.7) +
        Math.sin((x + y) * sc + time * 0.5) +
        Math.sin(Math.sqrt(x * x + y * y) * sc * 1.4 - time * 0.4);
      v = (v / 4 + 1) / 2; // 0..1
      v = Math.min(1, Math.max(0, (v - 0.5) * cf + 0.5));
      // 3-stop ramp: A -> B -> C
      const col = v < 0.5 ? mixRgb(a, b, v * 2) : mixRgb(b, c, (v - 0.5) * 2);
      const mixed = mixRgb(bg, col, inten);
      const o = (y * bw + x) * 4;
      d[o] = mixed.r;
      d[o + 1] = mixed.g;
      d[o + 2] = mixed.b;
      d[o + 3] = 255;
    }
  }
  bctx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.filter = s.smoothness > 0 ? `blur(${(s.smoothness / 100) * 4}px)` : "none";
  ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
  ctx.filter = "none";
}
