import type { MeshLiquidSettings, MotionStyle } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Mesh / Liquid — simple flowing gradient waves (v1).                */
/*  Layered translucent sine bands blending Color A -> B over Onyx.    */
/* ------------------------------------------------------------------ */

export function renderMeshLiquid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: MeshLiquidSettings,
  timeSec: number,
  _motion: MotionStyle,
): void {
  void _motion;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const t = timeSec * s.speed;
  const amp = (s.distortion / 100) * h * 0.16 + h * 0.03;
  const flow = 0.3 + (s.flow / 100) * 1.4;
  const bands = 5 + Math.round((s.smoothness / 100) * 5);

  ctx.globalCompositeOperation = "lighter";
  ctx.lineJoin = "round";

  for (let i = 0; i < bands; i++) {
    const p = i / (bands - 1 || 1);
    const cy = h * (0.15 + 0.7 * p);
    const col = mixRgb(a, b, p);
    const alpha = 0.10 + (s.highlights / 100) * 0.22;

    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const xn = x / w;
      const y =
        cy +
        Math.sin(xn * (2.2 + p * 1.5) * Math.PI + t * flow + i) * amp +
        Math.sin(xn * 5 * Math.PI - t * flow * 0.6) * amp * 0.35;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = h * 0.06 * (0.6 + s.scale / 200);
    ctx.strokeStyle = rgba(col, alpha);
    ctx.shadowBlur = 30 * (s.highlights / 100) + 6;
    ctx.shadowColor = rgba(col, 0.5);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}
