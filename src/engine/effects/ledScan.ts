import type { LedScanSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, lum } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  LED Scan — the image as a stadium LED panel.                       */
/*                                                                     */
/*  The source is sampled to a coarse grid; each cell becomes a round   */
/*  LED whose colour follows the chosen mode and whose brightness       */
/*  follows the cell luminance, boosted along Sobel edges. Glow radiates */
/*  only from lit LEDs. The matrix is rendered at a fixed reference      */
/*  resolution and blitted to the output, so the grid scale is identical */
/*  in preview and export and never shifts with zoom.                   */
/* ------------------------------------------------------------------ */

const REF = 1080;

const MODE_TINT: Record<string, [number, number, number]> = {
  cyan: [56, 225, 255],
  magenta: [255, 62, 200],
  white: [234, 242, 255],
};

let matrix: HTMLCanvasElement | null = null;
let matrixCtx: CanvasRenderingContext2D | null = null;

function getMatrix(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!matrix) {
    matrix = document.createElement("canvas");
    matrixCtx = matrix.getContext("2d");
  }
  if (matrix.width !== w || matrix.height !== h) {
    matrix.width = w;
    matrix.height = h;
  }
  return [matrix, matrixCtx!];
}

export function renderLedScan(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: LedScanSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const long = Math.max(1, Math.max(dw, dh));
  const ow = Math.max(1, Math.round((dw / long) * REF));
  const oh = Math.max(1, Math.round((dh / long) * REF));

  // LED cell size in reference px (small = fine detail, large = chunky).
  const ledPx = Math.max(4, Math.round(5 + (s.ledSize / 100) * 40));
  const cols = Math.max(1, Math.floor(ow / ledPx));
  const rows = Math.max(1, Math.floor(oh / ledPx));

  // Sample one averaged pixel per LED.
  const sctx = getBuffer("led-sample", cols, rows, true);
  sctx.clearRect(0, 0, cols, rows);
  sctx.drawImage(input, 0, 0, cols, rows);
  const data = sctx.getImageData(0, 0, cols, rows).data;

  // Cell luminance + Sobel edge magnitude for the neon-edge emphasis.
  const gray = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    gray[i] = lum(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }
  const edgeGain = s.sensitivity / 100;

  const [buf, bctx] = getMatrix(ow, oh);
  bctx.clearRect(0, 0, ow, oh);
  bctx.fillStyle = "#000";
  bctx.fillRect(0, 0, ow, oh);

  // Optional dark grid lines between LEDs (panel look).
  if (s.gridOpacity > 0) {
    bctx.strokeStyle = `rgba(0,0,0,${(s.gridOpacity / 100) * 0.9})`;
    bctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      bctx.beginPath();
      bctx.moveTo(x * ledPx, 0);
      bctx.lineTo(x * ledPx, rows * ledPx);
      bctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      bctx.beginPath();
      bctx.moveTo(0, y * ledPx);
      bctx.lineTo(cols * ledPx, y * ledPx);
      bctx.stroke();
    }
  }

  const bright = 0.4 + (s.brightness / 100) * 1.2;
  const radius = ledPx * 0.42;
  const tint = MODE_TINT[s.colorMode];

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = gy * cols + gx;
      // Sobel on the cell grid.
      let mag = 0;
      if (gx > 0 && gx < cols - 1 && gy > 0 && gy < rows - 1) {
        const sx =
          -gray[i - cols - 1] - 2 * gray[i - 1] - gray[i + cols - 1] +
          gray[i - cols + 1] + 2 * gray[i + 1] + gray[i + cols + 1];
        const sy =
          -gray[i - cols - 1] - 2 * gray[i - cols] - gray[i - cols + 1] +
          gray[i + cols - 1] + 2 * gray[i + cols] + gray[i + cols + 1];
        mag = Math.sqrt(sx * sx + sy * sy);
      }
      const litVal = clamp(gray[i] * 0.85 + mag * edgeGain * 0.9, 0, 1);
      if (litVal < 0.04) continue;

      let r: number, g: number, b: number;
      if (s.colorMode === "rgb") {
        r = data[i * 4];
        g = data[i * 4 + 1];
        b = data[i * 4 + 2];
      } else {
        r = tint[0];
        g = tint[1];
        b = tint[2];
      }
      const e = clamp(litVal * bright, 0, 1);
      bctx.fillStyle = `rgb(${(r * e) | 0},${(g * e) | 0},${(b * e) | 0})`;
      bctx.beginPath();
      bctx.arc((gx + 0.5) * ledPx, (gy + 0.5) * ledPx, radius, 0, Math.PI * 2);
      bctx.fill();
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.fillStyle = "#040404";
  ctx.fillRect(dx, dy, dw, dh);

  ctx.imageSmoothingEnabled = true;
  const gr = long / REF;
  // Glow from lit LEDs.
  if (s.glow > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (s.glow / 100) * 0.85;
    ctx.filter = `blur(${Math.max(2, 7 * gr)}px)`;
    ctx.drawImage(buf, 0, 0, ow, oh, dx, dy, dw, dh);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // Crisp LED matrix.
  ctx.drawImage(buf, 0, 0, ow, oh, dx, dy, dw, dh);
  ctx.restore();
}
