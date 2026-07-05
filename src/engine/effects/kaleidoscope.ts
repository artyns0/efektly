import type { KaleidoscopeSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, getBuffer } from "./fxUtils";

/* Kaleidoscope — radial mirrored wedges from a center sample. */

export function renderKaleidoscope(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: KaleidoscopeSettings,
): void {
  const { dx, dy, dw, dh } = rect;
  const w = Math.max(1, Math.round(dw));
  const h = Math.max(1, Math.round(dh));
  const segs = clamp(Math.round(s.segments), 3, 24);
  const wedge = (Math.PI * 2) / segs;

  // Source tile: sample around chosen center at chosen scale.
  const iw = (input as HTMLCanvasElement).width || w;
  const ih = (input as HTMLCanvasElement).height || h;
  const tileRes = 300;
  const tctx = getBuffer("kal-tile", tileRes, tileRes);
  tctx.clearRect(0, 0, tileRes, tileRes);
  const region = clamp(Math.min(iw, ih) * 0.6 / clamp(s.scale, 0.25, 4), 8, Math.min(iw, ih));
  const sx = clamp(s.centerX * iw - region / 2, 0, Math.max(0, iw - region));
  const sy = clamp(s.centerY * ih - region / 2, 0, Math.max(0, ih - region));
  tctx.drawImage(input, sx, sy, region, region, 0, 0, tileRes, tileRes);

  const b = getBuffer("kal-out", w, h);
  b.clearRect(0, 0, w, h);
  b.fillStyle = s.background;
  b.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.sqrt(cx * cx + cy * cy) + 2;
  const baseRot = (s.rotation * Math.PI) / 180;
  const mirror = s.mirrorAmount / 100;

  for (let i = 0; i < segs; i++) {
    b.save();
    b.translate(cx, cy);
    b.rotate(baseRot + i * wedge);
    // Clip to one wedge.
    b.beginPath();
    b.moveTo(0, 0);
    b.arc(0, 0, radius, -wedge / 2, wedge / 2);
    b.closePath();
    b.clip();
    if (i % 2 === 1 && mirror > 0) b.scale(1, -1); // alternate mirror
    b.globalAlpha = i % 2 === 1 ? clamp(mirror, 0.15, 1) : 1;
    b.drawImage(tctx.canvas, -radius, -radius, radius * 2, radius * 2);
    b.restore();
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.clearRect(dx, dy, dw, dh);
  const parts: string[] = [];
  if (s.softness > 0) parts.push(`blur(${(s.softness / 100) * 5}px)`);
  if (s.colorShift > 0) parts.push(`hue-rotate(${s.colorShift}deg)`);
  ctx.filter = parts.join(" ") || "none";
  ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
  if (s.glow > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (s.glow / 100) * 0.5;
    ctx.filter = `blur(${8 + (s.glow / 100) * 18}px)` + (parts.length ? " " + parts.join(" ") : "");
    ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.filter = "none";
  ctx.restore();
}
