import { useRef, useState } from "react";
import { Pause, Play, Repeat } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Timeline v1 — simple transport/scrub area (play/pause, loop,       */
/*  playhead, scrub). No keyframe workflow.                            */
/* ------------------------------------------------------------------ */

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const d = Math.floor((s * 10) % 10);
  return `${m}:${String(sec).padStart(2, "0")}.${d}`;
};

export function PlaygroundTimeline() {
  const effects = useAppStore((s) => s.effects);
  const stackedEffectIds = useAppStore((s) => s.stackedEffectIds);
  const tlTime = useAppStore((s) => s.tlTime);
  const tlDuration = useAppStore((s) => s.tlDuration);
  const tlPlaying = useAppStore((s) => s.tlPlaying);
  const tlLoop = useAppStore((s) => s.tlLoop);
  const setTlPlaying = useAppStore((s) => s.setTlPlaying);
  const setTlLoop = useAppStore((s) => s.setTlLoop);
  const setTlTime = useAppStore((s) => s.setTlTime);

  const laneRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const stacked = effects.filter((fx) => stackedEffectIds.includes(fx.id));
  const tracks = [
    { name: "Source", enabled: true },
    ...stacked.map((fx) => ({ name: fx.name, enabled: fx.enabled })),
  ];

  const pct = tlDuration > 0 ? (tlTime / tlDuration) * 100 : 0;
  const seconds = Math.max(1, Math.ceil(tlDuration));

  const seekAt = (clientX: number) => {
    const el = laneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - r.left, r.width));
    setTlTime((x / r.width) * tlDuration);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e0e]">
      {/* Transport bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <button
          type="button"
          onClick={() => setTlPlaying(!tlPlaying)}
          aria-label={tlPlaying ? "Pause" : "Play"}
          className="grid size-7 place-items-center rounded-lg bg-flame/15 text-flame transition-colors hover:bg-flame/25"
        >
          {tlPlaying ? (
            <Pause className="size-3.5" strokeWidth={2} />
          ) : (
            <Play className="size-3.5 translate-x-px" strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTlLoop(!tlLoop)}
          aria-label="Toggle loop"
          aria-pressed={tlLoop}
          className={cn(
            "grid size-7 place-items-center rounded-lg transition-colors",
            tlLoop
              ? "bg-flame/12 text-flame"
              : "text-linen/45 hover:bg-white/[0.05] hover:text-linen",
          )}
        >
          <Repeat className="size-3.5" strokeWidth={2} />
        </button>
        <span className="ml-1 font-mono text-[11px] tabular-nums text-linen/55">
          {fmt(tlTime)} / {fmt(tlDuration)}
        </span>
        <span className="ml-1 text-[13px] font-medium text-linen/80">Timeline</span>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Track labels */}
        <div className="w-40 shrink-0 border-r border-white/[0.06]">
          <div className="h-7 border-b border-white/[0.06]" />
          <div className="scroll-thin h-[calc(100%-1.75rem)] overflow-y-auto pb-2">
            {tracks.map((t) => (
              <div
                key={t.name}
                className="flex h-8 items-center gap-1.5 px-3"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    t.enabled ? "bg-flame" : "bg-white/20",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-[12px] font-medium",
                    t.enabled ? "text-linen/85" : "text-linen/40",
                  )}
                >
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ruler + lanes (scrub target) */}
        <div
          ref={laneRef}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setScrubbing(true);
            seekAt(e.clientX);
          }}
          onPointerMove={(e) => scrubbing && seekAt(e.clientX)}
          onPointerUp={() => setScrubbing(false)}
          onPointerCancel={() => setScrubbing(false)}
          className="relative min-w-0 flex-1 cursor-ew-resize select-none"
        >
          {/* Ruler */}
          <div className="flex h-7 items-end border-b border-white/[0.06]">
            {Array.from({ length: seconds + 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-l border-white/[0.05] pb-1 pl-1.5 text-[9px] font-medium text-linen/30"
              >
                {String(i).padStart(2, "0")}s
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-flame"
            style={{ left: `${pct}%` }}
          >
            <span className="absolute -left-[5px] -top-px size-2.5 rounded-b-sm bg-flame" />
          </div>

          {/* Lanes */}
          <div className="scroll-thin h-[calc(100%-1.75rem)] overflow-y-auto pb-2">
            {tracks.map((t) => (
              <div key={t.name} className="h-8 px-2 py-1.5">
                <div
                  className={cn(
                    "h-full rounded-md border",
                    t.enabled
                      ? "border-flame/20 bg-flame/[0.06]"
                      : "border-white/[0.05] bg-white/[0.015]",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
