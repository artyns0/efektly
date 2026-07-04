import { ChevronDown, Diamond, Eye, Lock, Plus, Repeat } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Timeline — VISUAL SHELL ONLY (Phase 3b polish).                    */
/*  Ruler, playhead, source + per-enabled-effect tracks with sample     */
/*  parameter rows and keyframe-dot placeholders. Not wired to          */
/*  rendering — real keyframes arrive with the Animate system.         */
/* ------------------------------------------------------------------ */

const SECONDS = 10;
const PLAYHEAD = 22; // percent
const PARAM_HINTS: Record<string, string[]> = {
  dither: ["Threshold", "Point Size"],
  ascii: ["Cell Size", "Contrast"],
  glitch: ["RGB Shift", "Distortion"],
  lineArt: ["Threshold", "Thickness"],
  grain: ["Amount", "Size"],
  reflectionGrid: ["Repeat Count", "Rotation"],
  verticalEcho: ["Echo Length", "Opacity Fade"],
};

function ToolbarButton({
  children,
  active,
  icon,
}: {
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium",
        active
          ? "border-flame/50 bg-flame/12 text-flame"
          : "border-white/[0.07] bg-white/[0.02] text-linen/55",
      )}
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
  const enabled = effects.filter((fx) => fx.enabled);

  const tracks = [
    { name: "Source", accent: "rgba(243,240,232,0.6)", params: [] as string[] },
    ...enabled.map((fx) => ({
      name: fx.name,
      accent: "#FF5A1F",
      params: PARAM_HINTS[fx.type] ?? [],
    })),
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-linen/[0.02]">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <span className="text-[13px] font-medium text-linen">Timeline Preview</span>
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-linen/45">
          Coming next
        </span>
        <span className="ml-2 min-w-0 flex-1 truncate text-[11px] text-linen/30">
          Keyframes and parameter animation arrive in the next phase.
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <ToolbarButton icon={<Plus className="size-3.5" />}>Add Keyframe</ToolbarButton>
          <ToolbarButton icon={<ChevronDown className="size-3.5" />}>
            Preset Animations
          </ToolbarButton>
          <ToolbarButton icon={<Repeat className="size-3.5" />}>Loop</ToolbarButton>
          <ToolbarButton>Range</ToolbarButton>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Track labels */}
        <div className="w-40 shrink-0 border-r border-white/[0.06]">
          <div className="h-7 border-b border-white/[0.06]" />
          <div className="scroll-thin h-full overflow-y-auto pb-2">
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

        {/* Ruler + lanes */}
        <div className="relative min-w-0 flex-1">
          {/* Ruler */}
          <div className="flex h-7 items-end border-b border-white/[0.06]">
            {Array.from({ length: SECONDS + 1 }).map((_, i) => (
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
            style={{ left: `${PLAYHEAD}%` }}
          >
            <span className="absolute -left-[5px] -top-px size-2.5 rounded-b-sm bg-flame" />
          </div>

          {/* Lanes */}
          <div className="scroll-thin h-[calc(100%-1.75rem)] overflow-y-auto pb-2">
            {tracks.map((t) => (
              <div key={t.name}>
                <div className="h-7 px-2 py-1">
                  <div className="h-full rounded-md bg-white/[0.02] px-1">
                    <Diamonds
                      positions={[12, 34, 58, 80]}
                      color={t.accent}
                    />
                  </div>
                </div>
                {t.params.map((p, i) => (
                  <div key={p} className="h-6 px-2 py-1">
                    <Diamonds
                      positions={i === 0 ? [20, 50, 74] : [30, 62, 88]}
                      color="rgba(179,90,60,0.85)"
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
