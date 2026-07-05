import type { KineticStripesSettings } from "../../types/shaders";
import { hexToRgb, mixRgb, rgba } from "./shaderUtils";

/* Kinetic Stripes — moving rotated stripe bands. */

export function renderKineticStripes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: KineticStripesSettings,
  t: number,
): void {
  const time = t * s.speed;
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);

  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);
  const diag = Math.sqrt(w * w + h * h);
  const n = Math.max(2, Math.round(s.stripeCount));
  const period = diag / n;
  const stripeW = period * (0.15 + (s.stripeWidth / 100) * 0.7);
  const soft = (s.softness / 100) * stripeW * 0.9;
  const alpha = 0.35 + (s.contrast / 100) * 0.65;
  const scroll = ((time * period * 0.4 + (s.offset / 100) * period) % period + period) % period;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((s.angle * Math.PI) / 180);
  for (let i = -1; i <= n + 1; i++) {
    const x = -diag / 2 + i * period + scroll;
    if (soft > 0) {
      const g = ctx.createLinearGradient(x - soft, 0, x + stripeW + soft, 0);
      g.addColorStop(0, rgba(a, 0));
      g.addColorStop(soft / (stripeW + soft * 2), rgba(a, alpha));
      g.addColorStop(1 - soft / (stripeW + soft * 2), rgba(a, alpha));
      g.addColorStop(1, rgba(a, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - soft, -diag / 2, stripeW + soft * 2, diag);
    } else {
      ctx.fillStyle = rgba(a, alpha);
      ctx.fillRect(x, -diag / 2, stripeW, diag);
    }
    // Thin secondary stripe.
    ctx.fillStyle = rgba(mixRgb(a, b, 0.6), alpha * 0.4);
    ctx.fillRect(x + period * 0.6, -diag / 2, stripeW * 0.25, diag);
  }
  ctx.restore();
}
