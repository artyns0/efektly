import type { ResolutionId } from "../types/app";

/* ------------------------------------------------------------------ */
/*  Shared fit / resolution math for preview and export.               */
/* ------------------------------------------------------------------ */

export interface Box {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/** Contain-fit a source rect into a destination rect, centered. */
export function containBox(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): Box {
  const scale = Math.min(dstW / srcW, dstH / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  return { dx: (dstW - dw) / 2, dy: (dstH - dh) / 2, dw, dh };
}

const FIXED_DIMS: Record<Exclude<ResolutionId, "original">, [number, number]> = {
  "1080p": [1920, 1080],
  vertical: [1080, 1920],
  square: [1080, 1080],
};

/** Exact output pixel size for a resolution choice ("original" = source). */
export function targetDims(
  res: ResolutionId,
  srcW: number,
  srcH: number,
): [number, number] {
  if (res === "original") return [Math.max(1, srcW), Math.max(1, srcH)];
  return FIXED_DIMS[res];
}
