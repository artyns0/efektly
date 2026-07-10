import type { FitRect } from "./dotMatrix";

/* ------------------------------------------------------------------ */
/*  Shared "Video only" notice for temporal effects applied to a still  */
/*  image. Draws the dimmed source with a centred label so the effect   */
/*  reads as inactive rather than broken.                              */
/* ------------------------------------------------------------------ */

export function videoOnlyNotice(
  ctx: CanvasRenderingContext2D,
  rect: FitRect,
  input: CanvasImageSource,
  name: string,
): void {
  const { dx, dy, dw, dh } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  ctx.drawImage(input, dx, dy, dw, dh);
  ctx.fillStyle = "rgba(6,6,8,0.6)";
  ctx.fillRect(dx, dy, dw, dh);

  const cx = dx + dw / 2;
  const cy = dy + dh / 2;
  const s = Math.max(0.5, Math.min(dw, dh) / 480);

  ctx.fillStyle = "rgba(243,240,232,0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(20 * s)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(`${name} — Video only`, cx, cy - 12 * s);

  ctx.fillStyle = "rgba(243,240,232,0.5)";
  ctx.font = `400 ${Math.round(13 * s)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText("Load a video to use this effect.", cx, cy + 14 * s);

  ctx.restore();
}
