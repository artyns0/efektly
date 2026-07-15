import type { EffectInstance, EffectType } from "../../types/effects";
import { defaultEffectSettings } from "../../data/effects";
import { renderFrame } from "../export/renderExportFrame";
import type { MediaEl } from "../pipeline";

/* ------------------------------------------------------------------ */
/*  Developer-only preview/export parity check. NOT imported by any    */
/*  production component — call it from the console during dev:        */
/*                                                                     */
/*    const m = await import('/src/engine/effects/__fxParity.ts');     */
/*    await m.runFxParity(img);                                        */
/*                                                                     */
/*  For each effect it renders the stack at a small "preview" size and  */
/*  a large "export" size, downscales the export to the preview size,   */
/*  and reports the fraction of pixels that still differ. A LOW score   */
/*  means preview and export look the same (resolution-normalized); a   */
/*  HIGH score flags a spatial parameter that still changes with        */
/*  resolution.                                                        */
/* ------------------------------------------------------------------ */

const REGISTRY: EffectType[] = [
  "dither", "ascii", "glitch", "lineArt", "grain", "crosshatch",
  "scanStretch", "pixelSort", "lightTrails", "crtMonitor", "vhsBleed",
  "kaleidoscope", "neonEdge", "opticalGlass", "visionTracker",
];

function inst(type: EffectType): EffectInstance {
  return {
    id: type, type, name: type, enabled: true, status: "ui-ready",
    settings: defaultEffectSettings(type),
  } as EffectInstance;
}

function renderAt(media: MediaEl, type: EffectType, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  // Fixed time so animated effects are deterministic across both renders.
  renderFrame(c.getContext("2d")!, media, [inst(type)], w, h, 1000);
  return c;
}

/**
 * Mean per-channel difference after collapsing both renders to a small grid.
 *
 * The downscale is deliberate: it averages away the per-pixel PHASE of a
 * pattern (dither noise, hatch/scanline position) — which never aligns pixel-
 * perfectly between two resolutions — and measures what actually matters for
 * parity: density, scale, tone and contrast. A real resolution bug (e.g. dots
 * 5× denser at export) survives the downscale; harmless phase noise does not.
 */
function diff(a: HTMLCanvasElement, b: HTMLCanvasElement): number {
  const gw = 96;
  const gh = Math.max(1, Math.round((gw * a.height) / a.width));
  const shrink = (src: HTMLCanvasElement) => {
    const c = document.createElement("canvas");
    c.width = gw;
    c.height = gh;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, 0, 0, gw, gh);
    return ctx.getImageData(0, 0, gw, gh).data;
  };
  const da = shrink(a);
  const db = shrink(b);
  let sum = 0;
  const n = gw * gh;
  for (let i = 0; i < da.length; i += 4) {
    sum += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
  }
  return sum / n / 3 / 255; // 0 = identical density/tone
}

/** Whole-frame mean colour, so binary/stochastic effects can be judged by
 *  overall density/tone rather than per-pixel pattern phase. */
function meanTone(cv: HTMLCanvasElement): [number, number, number] {
  const d = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
  let r = 0, g = 0, b = 0;
  const n = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
  }
  return [r / n, g / n, b / n];
}

export interface ParityRow {
  effect: EffectType;
  /** Local density/scale mismatch after downscaling both renders. */
  parityDiff: number;
  /** Overall tone mismatch — the reliable signal for binary/noise effects. */
  toneDiff: number;
  flag: "" | "MISMATCH";
}

export async function runFxParity(
  media: MediaEl,
  previewEdge = 820,
  exportEdge = 3600,
  threshold = 0.05,
): Promise<ParityRow[]> {
  const ar = 3 / 2; // render aspect for the test frame
  const pw = previewEdge, ph = Math.round(previewEdge / ar);
  const ew = exportEdge, eh = Math.round(exportEdge / ar);

  const rows: ParityRow[] = [];
  for (const effect of REGISTRY) {
    const prev = renderAt(media, effect, pw, ph);
    const exp = renderAt(media, effect, ew, eh);
    const d = +diff(prev, exp).toFixed(3);
    const mp = meanTone(prev);
    const me = meanTone(exp);
    const tone = +(
      (Math.abs(mp[0] - me[0]) + Math.abs(mp[1] - me[1]) + Math.abs(mp[2] - me[2])) /
      3 /
      255
    ).toFixed(3);
    // A real mismatch shifts BOTH local density and overall tone; pure pattern
    // phase (crisp dither/hatch) shifts only the local metric.
    const flag = tone > threshold ? "MISMATCH" : "";
    rows.push({ effect, parityDiff: d, toneDiff: tone, flag });
  }
  return rows;
}
