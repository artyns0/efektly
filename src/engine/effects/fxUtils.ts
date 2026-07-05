/* Shared helpers for the v2 effect pack — cached buffers + color math. */

const buffers = new Map<string, HTMLCanvasElement>();

/** Cached offscreen canvas ctx, resized on demand. */
export function getBuffer(
  id: string,
  w: number,
  h: number,
  readFrequently = false,
): CanvasRenderingContext2D {
  let c = buffers.get(id);
  if (!c) {
    c = document.createElement("canvas");
    buffers.set(id, c);
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c.getContext("2d", { willReadFrequently: readFrequently })!;
}

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export const lum = (r: number, g: number, b: number) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Deterministic pseudo-random in [0,1). */
export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
