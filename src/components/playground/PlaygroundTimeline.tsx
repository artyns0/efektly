import { useRef, useState } from "react";
import { ChevronDown, Diamond, Eye, Lock, Pause, Play, Plus, Repeat } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Timeline v1 — working project clock (play/pause, playhead, scrub,  */
/*  loop). Tracks + keyframe diamonds remain visual placeholders.      */
/* ------------------------------------------------------------------ */

/** Placeholder parameter rows under the first effect track (UI shell). */
const PARAM_ROWS = ["Position", "Turbulence", "Displace", "Brightness"];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const d = Math.floor((s * 10) % 10);
  return `${m}:${String(sec).padStart(2, "0")}.${d}`;
};

function StubButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 text-[11px] font-medium text-linen/45"
    >
      {icon}
      {children}
    </button>
  );
}

function Diamonds({ positions, color }: { positions: number[]; color: string }) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.06]" />
      {positions.map((p, i) => (
        <Diamond
          key={i}
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p}%`, color }}
          fill="currentColor"
        />
      ))}
    </div>
  );
}

export function PlaygroundTimeline() {
  const effects = useAppStore((s) => s.effects);
  const tlTime = useAppStore((s) => s.tlTime);
  const tlDuration = useAppStore((s) => s.tlDuration);
  const tlPlaying = useAppStore((s) => s.tlPlaying);
  const tlLoop = useAppStore((s) => s.tlLoop);
  const setTlPlaying = useAppStore((s) => s.setTlPlaying);
  const setTlLoop = useAppStore((s) => s.setTlLoop);
  const setTlTime = useAppStore((s) => s.setTlTime);

  const laneRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const enabled = effects.filter((fx) => fx.enabled);
  const tracks = [
    { name: "Source", accent: "rgba(243,240,232,0.6)", params: [] as string[] },
    ...enabled.map((fx) => ({
      name: fx.name,
      accent: "#FF5A1F",
      params: PARAM_ROWS,
    })),
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-linen/[0.02]">
      {/* Toolbar */}
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
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-linen/40">
          Keyframes next
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <StubButton icon={<Plus className="size-3.5" />}>Add Keyframe</StubButton>
          <StubButton icon={<ChevronDown className="size-3.5" />}>
            Preset Animations
          </StubButton>
          <StubButton>Range</StubButton>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Track labels */}
        <div className="w-40 shrink-0 border-r border-white/[0.06]">
          <div className="h-7 border-b border-white/[0.06]" />
          <div className="scroll-thin h-[calc(100%-1.75rem)] overflow-y-auto pb-2">
            {tracks.map((t, ti) => (
              <div key={t.name}>
                <div className="flex h-7 items-center gap-1.5 px-3">
                  <Eye className="size-3 shrink-0 text-linen/40" />
                  <span
                    className={cn(
                      "truncate text-[12px] font-medium",
                      ti === 0 ? "text-linen/70" : "text-linen/85",
                    )}
                  >
                    {t.name}
                  </span>
                  <Lock className="ml-auto size-3 shrink-0 text-linen/20" />
                </div>
                {t.params.map((p) => (
                  <div
                    key={p}
                    className="flex h-6 items-center pl-8 text-[10px] text-linen/35"
                  >
                    {p}
                  </div>
                ))}
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
              <div key={t.name}>
                <div className="h-7 px-2 py-1">
                  <div className="h-full rounded-md bg-white/[0.02] px-1">
                    <Diamonds positions={[12, 34, 58, 80]} color={t.accent} />
                  </div>
                </div>
                {t.params.map((p, i) => (
                  <div key={p} className="relative h-6 px-2 py-1">
                    {p === "Turbulence" && (
                      <svg
                        className="pointer-events-none absolute inset-x-2 inset-y-0"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,7 C15,7 20,3 32,3 S55,8 68,6 S90,2 100,4"
                          fill="none"
                          stroke="#FF5A1F"
                          strokeOpacity="0.7"
                          strokeWidth="0.7"
                        />
                      </svg>
                    )}
                    <Diamonds
                      positions={i === 0 ? [20, 50, 74] : [30, 62, 88]}
                      color={p === "Turbulence" ? "#FF5A1F" : "rgba(243,240,232,0.65)"}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
