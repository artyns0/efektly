import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";

const MAX_VIDEO = 20;
const IMAGE_DURATION = 10;

/* ------------------------------------------------------------------ */
/*  Timeline v1 driver (playground only). Owns the project clock:      */
/*  - duration: video length capped at 20s, else 10s default          */
/*  - advances tlTime while playing (video = master when present)      */
/*  - Space toggles play/pause (unless typing)                        */
/* ------------------------------------------------------------------ */

export function useTimeline() {
  const mediaType = useAppStore((s) => s.mediaType);
  const videoDuration = useAppStore((s) => s.duration); // video mirror
  const setTlDuration = useAppStore((s) => s.setTlDuration);

  // Duration follows the source; reset the playhead when it changes.
  useEffect(() => {
    let d = IMAGE_DURATION;
    if (mediaType === "video") {
      d = videoDuration && isFinite(videoDuration)
        ? Math.min(videoDuration, MAX_VIDEO)
        : MAX_VIDEO;
    }
    setTlDuration(d);
    useAppStore.setState({ tlTime: 0 });
  }, [mediaType, videoDuration, setTlDuration]);

  // Clock.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = useAppStore.getState();
      const v = s.mediaVideo;
      const running = s.tlPlaying || (!!v && !v.paused && !v.ended);
      if (running) {
        let t: number;
        if (v) {
          t = Math.min(v.currentTime, s.tlDuration);
          if (v.ended || t >= s.tlDuration - 0.03) {
            if (s.tlLoop) {
              v.currentTime = 0;
              t = 0;
            } else {
              v.pause();
              useAppStore.setState({ tlPlaying: false });
            }
          }
        } else {
          t = s.tlTime + dt;
          if (t >= s.tlDuration) {
            if (s.tlLoop) t = t % s.tlDuration;
            else {
              t = s.tlDuration;
              useAppStore.setState({ tlPlaying: false });
            }
          }
        }
        useAppStore.setState({ tlTime: t });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Space = play/pause, unless typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      e.preventDefault();
      const s = useAppStore.getState();
      s.setTlPlaying(!s.tlPlaying);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
