import {
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { formatDuration } from "../../lib/media";

/* ------------------------------------------------------------------ */
/*  Playback controls for an uploaded video: play/pause, scrub,        */
/*  time readout, and loop. All state is mirrored from the <video>.    */
/* ------------------------------------------------------------------ */

export function MediaVideoControls() {
  const isPlaying = useAppStore((s) => s.isPlaying);
  const currentTime = useAppStore((s) => s.currentTime);
  const duration = useAppStore((s) => s.duration);
  const loop = useAppStore((s) => s.loop);
  const muted = useAppStore((s) => s.muted);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const setLoop = useAppStore((s) => s.setLoop);
  const toggleMute = useAppStore((s) => s.toggleMute);
  const seek = useAppStore((s) => s.seek);
  const mediaVideo = useAppStore((s) => s.mediaVideo);

  const fill = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Go to beginning and play.
  const restart = () => {
    seek(0);
    if (mediaVideo?.paused) void mediaVideo.play();
  };
  // Pause and reset to the start.
  const stop = () => {
    mediaVideo?.pause();
    seek(0);
  };
  // Pause on the last frame.
  const goToEnd = () => {
    mediaVideo?.pause();
    seek(Math.max(0, (duration || 0) - 0.05));
  };

  const transportBtn =
    "grid size-8 shrink-0 place-items-center rounded-lg text-linen/55 transition-colors hover:bg-linen/[0.06] hover:text-linen disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5">
      <button type="button" onClick={restart} aria-label="Restart" title="Restart" className={transportBtn}>
        <SkipBack className="size-4" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-flame/15 text-flame transition-colors hover:bg-flame/25"
      >
        {isPlaying ? (
          <Pause className="size-4" strokeWidth={2} />
        ) : (
          <Play className="size-4 translate-x-px" strokeWidth={2} />
        )}
      </button>

      <button type="button" onClick={stop} aria-label="Stop" title="Stop" className={transportBtn}>
        <Square className="size-3.5" strokeWidth={2} fill="currentColor" />
      </button>

      <button type="button" onClick={goToEnd} aria-label="Go to end" title="Go to end" className={transportBtn}>
        <SkipForward className="size-4" strokeWidth={2} />
      </button>

      <input
        type="range"
        className="ef-range flex-1"
        min={0}
        max={duration || 0}
        step={0.01}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-label="Scrub video"
      />

      <span className="shrink-0 font-mono text-[11px] tabular-nums text-linen/55">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        aria-pressed={!muted}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
          muted
            ? "text-linen/40 hover:bg-linen/[0.06] hover:text-linen"
            : "text-flame hover:bg-flame/10",
        )}
      >
        {muted ? (
          <VolumeX className="size-4" strokeWidth={2} />
        ) : (
          <Volume2 className="size-4" strokeWidth={2} />
        )}
      </button>

      <button
        type="button"
        onClick={() => setLoop(!loop)}
        aria-label="Toggle loop"
        aria-pressed={loop}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
          loop
            ? "text-flame hover:bg-flame/10"
            : "text-linen/40 hover:bg-linen/[0.06] hover:text-linen",
        )}
      >
        <Repeat className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
