import type { VisionTrackerSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";
import { clamp, fxScale, getBuffer, hexToRgb } from "./fxUtils";

/* ------------------------------------------------------------------ */
/*  Vision Tracker — TouchDesigner-style blob tracking overlay.        */
/*  Analyses the real image/video frame: grayscale → threshold →       */
/*  binary mask → connected-component blobs → cross-frame ID tracking   */
/*  → HUD overlay (boxes / centers / IDs / lines / network / trails).  */
/*  Runs at a reduced internal resolution for real-time video.         */
/* ------------------------------------------------------------------ */

interface Blob {
  minX: number; maxX: number; minY: number; maxY: number;
  count: number; sumX: number; sumY: number; sumG: number;
  cx: number; cy: number;
}

interface Tracked {
  id: number;
  cx: number; cy: number; w: number; h: number;
  area: number; vx: number; vy: number; age: number; conf: number;
  missing: number;
  trail: { x: number; y: number }[];
}

let tracked: Tracked[] = [];
let nextId = 1;
let prevGray: Float32Array | null = null;
let prevDims = "";

const SCALE_PX: Record<string, number> = { low: 240, medium: 360, high: 480 };

/** Reset tracker state (dimensions changed / media swapped). */
function resetIfNeeded(w: number, h: number): void {
  const dims = `${w}x${h}`;
  if (dims !== prevDims) {
    prevDims = dims;
    prevGray = null;
    tracked = [];
    nextId = 1;
  }
}

export function renderVisionTracker(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  s: VisionTrackerSettings,
): void {
  const { dw, dh } = rect;
  const targetW = SCALE_PX[s.processingScale] ?? 360;
  const sc = Math.min(1, targetW / Math.max(1, dw));
  const w = Math.max(8, Math.round(dw * sc));
  const h = Math.max(8, Math.round(dh * sc));
  resetIfNeeded(w, h);

  // 1 — sample the frame at reduced resolution.
  const buf = getBuffer("vt-src", w, h, true);
  buf.clearRect(0, 0, w, h);
  buf.drawImage(input, 0, 0, w, h);
  const px = buf.getImageData(0, 0, w, h).data;

  // 2 — grayscale + contrast.
  const n = w * h;
  const gray = new Float32Array(n);
  const cFactor = 1 + (s.contrast / 100) * 2;
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    let g = (0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2]) / 255;
    g = clamp((g - 0.5) * cFactor + 0.5, 0, 1);
    gray[i] = g;
  }

  // 3 — optional blur (separable box blur).
  const detect = s.blur > 0 ? boxBlur(gray, w, h, 1 + Math.round((s.blur / 100) * 3)) : gray;

  // 4 — build the value used for thresholding (raw / difference / motion).
  const val = new Float32Array(n);
  const usePrev = (s.backgroundDiff || s.motionDiff) && prevGray && prevGray.length === n;
  for (let i = 0; i < n; i++) {
    if (usePrev) val[i] = Math.abs(detect[i] - prevGray![i]) * 2.2;
    else val[i] = detect[i];
  }

  // 5 — binary mask.
  const thr = clamp(s.threshold / 100 + (0.5 - s.sensitivity / 100) * 0.3, 0.02, 0.98);
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let on = val[i] >= thr;
    if (s.invert && !usePrev) on = !on;
    mask[i] = on ? 1 : 0;
  }

  // keep current frame for next diff (post-blur grayscale)
  prevGray = detect.slice();

  // 6 — connected components (iterative flood fill, 4-connectivity).
  const areaPx = n;
  const minA = Math.max(3, (s.minArea / 100) * areaPx * 0.06);
  const maxA = (0.02 + (s.maxArea / 100) * 0.98) * areaPx;
  const blobs = connectedComponents(mask, gray, w, h, minA, maxA);

  // 7 — optional merge nearby blobs.
  const merged = s.mergeDistance > 0
    ? mergeBlobs(blobs, (s.mergeDistance / 100) * Math.max(w, h) * 0.3)
    : blobs;

  // 8 — cap to the largest N.
  merged.sort((a, b) => b.count - a.count);
  const kept = merged.slice(0, Math.max(1, Math.round(s.maxBlobs)));

  // 9 — track across frames for stable IDs.
  trackBlobs(kept, s, w, h);

  // 10 — draw background + overlay.
  drawBackground(ctx, rect, s, mask, gray, w, h);
  drawOverlay(ctx, rect, s, w, h);
}

/* --------------------------- detection --------------------------- */

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const norm = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc * norm;
      const add = src[y * w + clamp(x + r + 1, 0, w - 1)];
      const sub = src[y * w + clamp(x - r, 0, w - 1)];
      acc += add - sub;
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc * norm;
      const add = tmp[clamp(y + r + 1, 0, h - 1) * w + x];
      const sub = tmp[clamp(y - r, 0, h - 1) * w + x];
      acc += add - sub;
    }
  }
  return out;
}

function connectedComponents(
  mask: Uint8Array, gray: Float32Array, w: number, h: number,
  minA: number, maxA: number,
): Blob[] {
  const labels = new Int32Array(w * h).fill(0);
  const stack: number[] = [];
  const blobs: Blob[] = [];
  let label = 0;
  for (let i = 0; i < w * h; i++) {
    if (mask[i] === 0 || labels[i] !== 0) continue;
    label++;
    stack.length = 0;
    stack.push(i);
    labels[i] = label;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    let count = 0, sumX = 0, sumY = 0, sumG = 0;
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % w;
      const y = (p / w) | 0;
      count++; sumX += x; sumY += y; sumG += gray[p];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x > 0 && mask[p - 1] && !labels[p - 1]) { labels[p - 1] = label; stack.push(p - 1); }
      if (x < w - 1 && mask[p + 1] && !labels[p + 1]) { labels[p + 1] = label; stack.push(p + 1); }
      if (y > 0 && mask[p - w] && !labels[p - w]) { labels[p - w] = label; stack.push(p - w); }
      if (y < h - 1 && mask[p + w] && !labels[p + w]) { labels[p + w] = label; stack.push(p + w); }
    }
    if (count < minA || count > maxA) continue;
    blobs.push({
      minX, maxX, minY, maxY, count, sumX, sumY, sumG,
      cx: sumX / count, cy: sumY / count,
    });
  }
  return blobs;
}

function mergeBlobs(blobs: Blob[], dist: number): Blob[] {
  const out = blobs.slice();
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < out.length; i++) {
      for (let k = i + 1; k < out.length; k++) {
        const a = out[i], b = out[k];
        if (Math.hypot(a.cx - b.cx, a.cy - b.cy) < dist) {
          const c = a.count + b.count;
          out[i] = {
            minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
            minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY),
            count: c, sumX: a.sumX + b.sumX, sumY: a.sumY + b.sumY, sumG: a.sumG + b.sumG,
            cx: (a.sumX + b.sumX) / c, cy: (a.sumY + b.sumY) / c,
          };
          out.splice(k, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }
  return out;
}

/* --------------------------- tracking --------------------------- */

function trackBlobs(blobs: Blob[], s: VisionTrackerSettings, w: number, h: number): void {
  const matchD = (s.matchDistance / 100) * Math.max(w, h) * 0.5 + 6;
  const smooth = s.smoothing / 100;
  const vSmooth = s.velocitySmoothing / 100;
  const stability = s.idStability / 100;
  const usedT = new Set<number>();

  const measures = blobs.map((b) => ({
    cx: b.cx, cy: b.cy,
    w: b.maxX - b.minX + 1, h: b.maxY - b.minY + 1,
    area: b.count, conf: b.sumG / b.count,
  }));

  const matchedMeasure = new Set<number>();
  // Greedy nearest match: each measurement → closest unused track.
  for (let mi = 0; mi < measures.length; mi++) {
    const m = measures[mi];
    let best = -1, bestD = Infinity;
    for (let ti = 0; ti < tracked.length; ti++) {
      if (usedT.has(ti)) continue;
      const t = tracked[ti];
      const d = Math.hypot(m.cx - t.cx, m.cy - t.cy);
      // size similarity gate
      const sizeRatio = Math.min(m.area, t.area) / Math.max(m.area, t.area);
      const gate = matchD * (0.5 + sizeRatio * 0.5) * (0.7 + stability * 0.6);
      if (d < gate && d < bestD) { bestD = d; best = ti; }
    }
    if (best >= 0) {
      const t = tracked[best];
      usedT.add(best);
      matchedMeasure.add(mi);
      const nx = t.cx + (m.cx - t.cx) * (1 - smooth * 0.7);
      const ny = t.cy + (m.cy - t.cy) * (1 - smooth * 0.7);
      const rvx = nx - t.cx, rvy = ny - t.cy;
      t.vx = t.vx * vSmooth + rvx * (1 - vSmooth);
      t.vy = t.vy * vSmooth + rvy * (1 - vSmooth);
      t.cx = nx; t.cy = ny;
      t.w = t.w + (m.w - t.w) * (1 - smooth * 0.7);
      t.h = t.h + (m.h - t.h) * (1 - smooth * 0.7);
      t.area = m.area; t.conf = m.conf;
      t.age++; t.missing = 0;
      t.trail.push({ x: t.cx, y: t.cy });
    }
  }

  // New tracks for unmatched measurements.
  for (let mi = 0; mi < measures.length; mi++) {
    if (matchedMeasure.has(mi)) continue;
    const m = measures[mi];
    tracked.push({
      id: nextId++, cx: m.cx, cy: m.cy, w: m.w, h: m.h, area: m.area,
      vx: 0, vy: 0, age: 1, conf: m.conf, missing: 0, trail: [{ x: m.cx, y: m.cy }],
    });
  }

  // Age out unmatched tracks with persistence fade.
  const maxMiss = 1 + Math.round((s.persistence / 100) * 30);
  const trailMax = 2 + Math.round((s.trailLength / 100) * 40);
  const next: Tracked[] = [];
  for (let ti = 0; ti < tracked.length; ti++) {
    const t = tracked[ti];
    if (!usedT.has(ti)) {
      t.missing++;
      t.cx += t.vx; t.cy += t.vy; // coast
      if (t.missing > maxMiss) continue;
    }
    if (t.trail.length > trailMax) t.trail.splice(0, t.trail.length - trailMax);
    next.push(t);
  }
  tracked = next;
}

/* --------------------------- rendering --------------------------- */

function drawBackground(
  ctx: CanvasRenderingContext2D, rect: FitRect,
  s: VisionTrackerSettings, mask: Uint8Array, gray: Float32Array, w: number, h: number,
): void {
  const { dx, dy, dw, dh } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  if (s.background === "original") {
    // leave the existing frame as-is
  } else if (s.background === "black") {
    ctx.fillStyle = "#000";
    ctx.fillRect(dx, dy, dw, dh);
  } else {
    // grayscale / threshold / difference rendered from the low-res buffers
    const b = getBuffer("vt-bg", w, h);
    const img = b.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < w * h; i++) {
      let v: number;
      if (s.background === "threshold") v = mask[i] ? 255 : 0;
      else v = gray[i] * 255; // grayscale + difference both show gray field
      d[i * 4] = v; d[i * 4 + 1] = v; d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
    b.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = s.background !== "threshold";
    ctx.drawImage(b.canvas, 0, 0, w, h, dx, dy, dw, dh);
    ctx.imageSmoothingEnabled = true;
  }
  ctx.restore();
}

function shapeFlags(s: VisionTrackerSettings) {
  // Shape mode sets defaults; explicit toggles add on top.
  const m = s.shapeMode;
  const box =
    m === "boxes" || m === "boxesLines" || m === "cube" || m === "hud" || m === "dataLabels";
  const centers = m === "dots" || m === "crosshair" || m === "boxesLines" || m === "lines";
  const lines = m === "lines" || m === "boxesLines";
  const network = m === "network";
  const ids = m === "hud" || m === "dataLabels" || m === "boxes" || m === "boxesLines";
  const area = m === "dataLabels";
  return {
    box: box || s.showBoxes,
    centers: centers || s.showCenters,
    ids: ids || s.showIds,
    area: area || s.showArea,
    lines: lines || s.showLines,
    network: network || s.showNetwork,
    trails: s.showTrails,
    style: m,
  };
}

function drawOverlay(
  ctx: CanvasRenderingContext2D, rect: FitRect, s: VisionTrackerSettings,
  w: number, h: number,
): void {
  const { dx, dy, dw, dh } = rect;
  const kx = dw / w, ky = dh / h;
  const X = (x: number) => dx + x * kx;
  const Y = (y: number) => dy + y * ky;
  const f = shapeFlags(s);

  const boxC = hexToRgb(s.boxColor);
  const lineC = hexToRgb(s.lineColor);
  const centerC = hexToRgb(s.centerColor);
  const op = clamp(s.opacity / 100, 0, 1);
  // HUD strokes/text are authored in pixels; scale them with the render size so
  // the overlay stays legible at full-resolution export (hairlines otherwise).
  const hud = fxScale(dw, dh);
  const boxLw = (0.5 + (s.boxThickness / 100) * 4) * hud;
  const lineLw = (0.5 + (s.lineThickness / 100) * 3) * hud;
  const fontPx = (7 + (s.textSize / 100) * 20) * hud;

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.globalAlpha = op;
  if (s.glow > 0) {
    ctx.shadowBlur = (s.glow / 100) * 16 * hud;
  }
  ctx.font = `600 ${fontPx}px ui-monospace, monospace`;
  ctx.textBaseline = "top";

  const rgb = (c: { r: number; g: number; b: number }, a = 1) =>
    `rgba(${c.r},${c.g},${c.b},${a})`;

  // connection lines / network
  if (f.lines || f.network) {
    const maxD = (s.lineDistance / 100) * Math.max(dw, dh) * 0.6 + 20;
    ctx.strokeStyle = rgb(lineC, 0.6);
    ctx.lineWidth = lineLw;
    ctx.shadowColor = rgb(lineC, 0.8);
    for (let i = 0; i < tracked.length; i++) {
      for (let k = i + 1; k < tracked.length; k++) {
        const a = tracked[i], b = tracked[k];
        const ax = X(a.cx), ay = Y(a.cy), bx = X(b.cx), by = Y(b.cy);
        const d = Math.hypot(ax - bx, ay - by);
        if (f.network && d > maxD) continue;
        if (f.lines && !f.network && k !== i + 1) continue; // simple chain
        ctx.globalAlpha = op * (f.network ? clamp(1 - d / maxD, 0, 1) : 0.5);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = op;
  }

  for (const t of tracked) {
    const fade = t.missing > 0 ? clamp(1 - t.missing / 20, 0.15, 1) : 1;
    const cx = X(t.cx), cy = Y(t.cy);
    const bw = t.w * kx, bh = t.h * ky;
    const bx = cx - bw / 2, by = cy - bh / 2;

    // trails
    if (f.trails && t.trail.length > 1) {
      ctx.strokeStyle = rgb(lineC, 0.5 * fade);
      ctx.lineWidth = lineLw;
      ctx.shadowColor = rgb(lineC, 0.7);
      ctx.beginPath();
      for (let p = 0; p < t.trail.length; p++) {
        const tx = X(t.trail[p].x), ty = Y(t.trail[p].y);
        if (p === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();
    }

    // boxes (style varies by shape mode)
    if (f.box) {
      ctx.strokeStyle = rgb(boxC, fade);
      ctx.lineWidth = boxLw;
      ctx.shadowColor = rgb(boxC, 0.9);
      if (f.style === "hud") {
        // corner brackets
        const cl = Math.min(bw, bh) * 0.28 + 3;
        const corners = [
          [bx, by, 1, 1], [bx + bw, by, -1, 1],
          [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1],
        ];
        for (const [px, py, sx, sy] of corners) {
          ctx.beginPath();
          ctx.moveTo(px + sx * cl, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * cl);
          ctx.stroke();
        }
      } else {
        ctx.strokeRect(bx, by, bw, bh);
        if (f.style === "cube") {
          const o = Math.min(bw, bh) * 0.18;
          ctx.globalAlpha = op * fade * 0.5;
          ctx.strokeRect(bx + o, by + o, bw - 2 * o, bh - 2 * o);
          ctx.globalAlpha = op * fade;
        }
      }
    }

    // centers
    if (f.centers) {
      ctx.fillStyle = rgb(centerC, fade);
      ctx.strokeStyle = rgb(centerC, fade);
      ctx.shadowColor = rgb(centerC, 0.9);
      if (f.style === "crosshair") {
        const cl = 4 + fontPx * 0.4;
        ctx.lineWidth = lineLw;
        ctx.beginPath();
        ctx.moveTo(cx - cl, cy); ctx.lineTo(cx + cl, cy);
        ctx.moveTo(cx, cy - cl); ctx.lineTo(cx, cy + cl);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, 2 + boxLw * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // labels
    if (f.ids || f.area) {
      ctx.fillStyle = rgb(hexToRgb(s.textColor), fade);
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      const label =
        (f.ids ? `#${t.id}` : "") +
        (f.ids && f.area ? " " : "") +
        (f.area ? `${Math.round(t.area)}` : "");
      if (label) ctx.fillText(label, bx, by - fontPx - 1 < dy ? by + 2 : by - fontPx - 1);
    }
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}
