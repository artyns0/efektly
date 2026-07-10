/* ------------------------------------------------------------------ */
/*  Temporal render context.                                           */
/*                                                                     */
/*  Temporal effects (Motion Trails, Slit Scan) need to know the media */
/*  timeline — not the wall clock — so they can accumulate frame        */
/*  history and reset it on a seek, loop or media swap. Rather than     */
/*  thread this through applyEffect() (and all 16 effect calls), the    */
/*  caller sets a small module-level context immediately before        */
/*  rendering the stack; temporal effects read it.                     */
/* ------------------------------------------------------------------ */

export interface FrameContext {
  /** Current media time in ms (video currentTime, or a per-frame export time). */
  mediaTimeMs: number;
  /** Identity of the current source/session; a change forces a history reset. */
  resetToken: string;
  /** Whether the source is actively advancing (video playing / exporting). */
  playing: boolean;
  /** Whether the current source is a video (temporal effects are video-only). */
  isVideo: boolean;
}

let current: FrameContext = {
  mediaTimeMs: 0,
  resetToken: "",
  playing: false,
  isVideo: false,
};

export function setFrameContext(ctx: FrameContext): void {
  current = ctx;
}

export function getFrameContext(): FrameContext {
  return current;
}
