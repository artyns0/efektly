export type FlapMood =
  | "idle"
  | "watching"
  | "wow"
  | "working"
  | "celebrate"
  | "sleepy"
  | "confused";

/** Send a product event to Flap without coupling features to the mascot UI. */
export function emitFlapReaction(mood: FlapMood, duration?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("efektly:flap", {
      detail: { mood, duration },
    }),
  );
}
