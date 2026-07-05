import type { LightTrailsSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer, lum } from "./fxUtils";

/* Light Trails — bright-pass smeared along a direction, glow composite. */

const BLEND: Record<LightTrailsSettings["blendMode"], GlobalCompositeOperation> = {
  screen: "screen",
  add: "lighter",
  "soft-light": "soft-light",
};

export function renderLightTrails(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: LightTrailsSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const sc = Math.min(1, 480 / Math.max(dw, dh));
  const w = Math.max(1, Math.round(dw * sc));
  const h = Math.max(1, Math.round(dh * sc));

  // Bright pass.
  const bp = getBuffer("trails-bp", w, h, true);
  bp.clearRect(0, 0, w, h);
  bp.drawImage(input, 0, 0, w, h);
  const img = bp.getImageData(0, 0, w, h);
  const d = img.data;
  const thr = s.threshold / 100;
  for (let i = 0; i < d.length; i += 4) {
    if (lum(d[i], d[i + 1], d[i + 2]) < thr) d[i + 3] = 0;
  }
  bp.putImageData(img, 0, 0);

  // Tint the bright pass.
  bp.globalCompositeOperation = "multiply";
  bp.fillStyle = s.color;
  bp.fillRect(0, 0, w, h);
  bp.globalCompositeOperation = "destination-in";
  bp.drawImage(bp.canvas, 0, 0); // keep alpha
  bp.globalCompositeOperation = "source-over";

  // Smear pass: repeated offset draws with decaying alpha.
  const tr = getBuffer("trails-smear", w, h);
  tr.clearRect(0, 0, w, h);
  const ang = (s.angle * Math.PI) / 180;
  const steps = 14;
  const total = (s.trailLength / 100) * Math.max(w, h) * 0.6;
  for (let i = 0; i < steps; i++) {
    const f = i / (steps - 1);
    tr.globalAlpha = clamp((1 - f * (s.decay / 100)) * 0.5, 0.02, 1);
    tr.drawImage(bp.canvas, Math.cos(ang) * total * f, Math.sin(ang) * total * f);
  }
  tr.globalAlpha = 1;

  // Composite over the original.
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.globalCompositeOperation = BLEND[s.blendMode] ?? "screen";
  ctx.globalAlpha = clamp(s.intensity / 100, 0, 1);
  if (s.blur > 0) ctx.filter = `blur(${(s.blur / 100) * 8}px)`;
  ctx.drawImage(tr.canvas, 0, 0, w, h, dx, dy, dw, dh);
  if (s.glow > 0) {
    ctx.filter = `blur(${4 + (s.glow / 100) * 20}px)`;
    ctx.globalAlpha = clamp((s.intensity / 100) * (s.glow / 100), 0, 1);
    ctx.drawImage(tr.canvas, 0, 0, w, h, dx, dy, dw, dh);
  }
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
