import type { MotionStyle, VoronoiSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rand } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Voronoi — simple animated cell pattern (v1).                       */
/*  Computed on a downscaled buffer for speed, then scaled up.         */
/* ------------------------------------------------------------------ */

let buf: HTMLCanvasElement | null = null;
let bufCtx: CanvasRenderingContext2D | null = null;

function getBuf(w: number, h: number): CanvasRenderingContext2D {
  if (!buf) {
    buf = document.createElement("canvas");
    bufCtx = buf.getContext("2d");
  }
  if (buf.width !== w || buf.height !== h) {
    buf.width = w;
    buf.height = h;
  }
  return bufCtx!;
}

export function renderVoronoi(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: VoronoiSettings,
  timeSec: number,
  _motion: MotionStyle,
): void {
  void _motion;
  // Work at reduced resolution — cheap enough for real-time.
  const bw = Math.max(1, Math.round(w / 5));
  const bh = Math.max(1, Math.round(h / 5));
  const bctx = getBuf(bw, bh);
  const img = bctx.createImageData(bw, bh);
  const d = img.data;

  const n = Math.max(3, Math.round(s.cellCount));
  const t = timeSec * s.speed;
  const wobble = (s.distortion / 100) * 0.25;
  const border = (s.borderWidth / 100) * 0.4 + 0.02;

  const bg = hexToRgb(s.background);
  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);

  // Animated seed positions.
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    sx[i] = (rand(i * 2 + 1) + Math.sin(t * 0.5 + i) * wobble) * bw;
    sy[i] = (rand(i * 2 + 2) + Math.cos(t * 0.4 + i * 1.3) * wobble) * bh;
  }

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      let d1 = Infinity;
      let d2 = Infinity;
      let nearest = 0;
      for (let i = 0; i < n; i++) {
        const dx = x - sx[i];
        const dy = y - sy[i];
        const dist = dx * dx + dy * dy;
        if (dist < d1) {
          d2 = d1;
          d1 = dist;
          nearest = i;
        } else if (dist < d2) {
          d2 = dist;
        }
      }
      // Edge factor: near cell borders (|d1-d2| small) -> border color.
      const edge = Math.sqrt(d2) - Math.sqrt(d1);
      const cell = rand(nearest * 3 + 7);
      const fillCol = mixRgb(a, b, cell);
      const isBorder = edge < border * Math.max(bw, bh) * 0.12;
      const col = isBorder ? mixRgb(bg, b, 0.6) : mixRgb(bg, fillCol, 0.55);

      const o = (y * bw + x) * 4;
      d[o] = col.r;
      d[o + 1] = col.g;
      d[o + 2] = col.b;
      d[o + 3] = 255;
    }
  }
  bctx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(buf!, 0, 0, bw, bh, 0, 0, w, h);
}
