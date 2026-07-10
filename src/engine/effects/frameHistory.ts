import { getFrameContext } from "./temporalContext";

/* ------------------------------------------------------------------ */
/*  Frame history — bounded, downsampled ring buffer per effect id.    */
/*                                                                     */
/*  Temporal effects push the current fitted frame each render and read */
/*  earlier frames back. Memory is capped two ways: a maximum frame     */
/*  count and a long-edge downsample cap, so even a 4K source keeps the */
/*  history small. History auto-resets when the media timeline jumps    */
/*  (seek / loop / new media) so trails never smear across a cut.       */
/* ------------------------------------------------------------------ */

const MAX_LONG_EDGE = 480; // downsample cap for every stored frame
const DEFAULT_MAX_FRAMES = 120;

interface Options {
  maxFrames: number;
}

export class FrameHistory {
  private frames: HTMLCanvasElement[] = [];
  private pool: HTMLCanvasElement[] = [];
  private maxFrames: number;
  private lastToken = "";
  private lastTime = -Infinity;
  /** Downsampled buffer dimensions (set from the first pushed frame). */
  w = 0;
  h = 0;

  constructor(opts: Options) {
    this.maxFrames = Math.max(2, opts.maxFrames);
  }

  setMaxFrames(n: number): void {
    this.maxFrames = Math.max(2, Math.floor(n));
    while (this.frames.length > this.maxFrames) {
      this.pool.push(this.frames.shift()!);
    }
  }

  private target(sw: number, sh: number): { w: number; h: number } {
    const long = Math.max(sw, sh);
    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(1, long));
    return {
      w: Math.max(1, Math.round(sw * scale)),
      h: Math.max(1, Math.round(sh * scale)),
    };
  }

  /** Reset when the media timeline is discontinuous (seek/loop/new source). */
  private maybeReset(): void {
    const { resetToken, mediaTimeMs } = getFrameContext();
    const jumpedBack = mediaTimeMs < this.lastTime - 40;
    const jumpedFar = mediaTimeMs > this.lastTime + 1000;
    if (resetToken !== this.lastToken || jumpedBack || jumpedFar) {
      this.reset();
    }
    this.lastToken = resetToken;
    this.lastTime = mediaTimeMs;
  }

  /** Store the current frame (downsampled). Call once per render. */
  push(frame: CanvasImageSource, sw: number, sh: number): void {
    this.maybeReset();
    const { w, h } = this.target(sw, sh);
    this.w = w;
    this.h = h;

    let c = this.frames.length >= this.maxFrames ? this.pool.pop() ?? this.frames.shift()! : this.pool.pop();
    if (!c) c = document.createElement("canvas");
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(frame, 0, 0, w, h);

    this.frames.push(c);
    while (this.frames.length > this.maxFrames) {
      this.pool.push(this.frames.shift()!);
    }
  }

  get size(): number {
    return this.frames.length;
  }

  /** Frame `n` steps back from newest (0 = newest). */
  at(n: number): HTMLCanvasElement | null {
    const idx = this.frames.length - 1 - n;
    return idx >= 0 ? this.frames[idx] : null;
  }

  /** Newest first. */
  newest(): HTMLCanvasElement | null {
    return this.frames.length ? this.frames[this.frames.length - 1] : null;
  }

  reset(): void {
    while (this.frames.length) this.pool.push(this.frames.pop()!);
  }

  /** Drop everything, including the pool, so canvases can be collected. */
  dispose(): void {
    this.frames.length = 0;
    this.pool.length = 0;
    this.w = 0;
    this.h = 0;
  }
}

const registry = new Map<string, FrameHistory>();

/** Per-effect-instance history, created on first use. */
export function getHistory(id: string, maxFrames = DEFAULT_MAX_FRAMES): FrameHistory {
  let h = registry.get(id);
  if (!h) {
    h = new FrameHistory({ maxFrames });
    registry.set(id, h);
  }
  return h;
}

/** Clear all history (media swap / clear). Keeps map entries but empties them. */
export function resetAllHistory(): void {
  for (const h of registry.values()) h.reset();
}

/** Fully drop a single effect's history (effect removed from the stack). */
export function disposeHistory(id: string): void {
  const h = registry.get(id);
  if (h) {
    h.dispose();
    registry.delete(id);
  }
}
