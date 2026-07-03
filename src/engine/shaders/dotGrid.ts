import type { DotGridSettings, MotionStyle } from "../../types/shaders";
import { hexToRgb, rgba } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Dot Grid — the real procedural shader.                             */
/*  A grid of dots on an Onyx field: brightness/size pulses over time, */
/*  a Tiger Flame accent wave travels across, and dots drift gently.   */
/* ------------------------------------------------------------------ */

export function renderDotGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: DotGridSettings,
  timeSec: number,
  motion: MotionStyle,
): void {
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const spacing = Math.max(8, s.spacing);
  const half = spacing / 2;
  const maxR = Math.max(0.5, half * Math.min(1, s.dotSize * 1.6));
  const pulseAmt = s.pulse / 100;
  const driftAmt = (s.drift / 100) * half * 0.9;
  const t = timeSec * s.speed;

  const colorA = hexToRgb(s.colorA);
  const colorB = hexToRgb(s.colorB);

  ctx.globalCompositeOperation = "lighter";

  for (let gy = half; gy < h + half; gy += spacing) {
    for (let gx = half; gx < w + half; gx += spacing) {
      // Positional drift depends on motion style.
      let ox = 0;
      let oy = 0;
      switch (motion) {
        case "wave":
          oy = Math.sin(t + gx * 0.03) * driftAmt * 1.6;
          break;
        case "chaos":
          ox = Math.sin(t * 1.3 + gx * 0.05 + gy * 0.03) * driftAmt;
          oy = Math.cos(t * 1.1 + gy * 0.05) * driftAmt;
          break;
        case "pulse":
          break; // size-only
        case "drift":
        default:
          ox = Math.sin(t * 0.6 + gy * 0.02) * driftAmt;
          oy = Math.cos(t * 0.5 + gx * 0.02) * driftAmt;
      }

      // Size pulse.
      const phase = Math.sin(t * 1.2 + (gx + gy) * 0.03);
      const r = maxR * (1 - pulseAmt * 0.5 + pulseAmt * 0.5 * phase);
      if (r < 0.4) continue;

      // Accent wave selects flame-colored dots (brand/duo modes).
      const accentWave = Math.sin(t * 0.8 + gx * 0.04 - gy * 0.02);
      const isAccent = s.colorMode !== "mono" && accentWave > 0.55;
      const base = isAccent ? colorB : colorA;
      const alpha = 0.55 + 0.45 * Math.max(0, phase);

      ctx.fillStyle = rgba(base, alpha);
      ctx.beginPath();
      ctx.arc(gx + ox, gy + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = "source-over";
}
