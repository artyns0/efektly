import {
  Diamond,
  Eye,
  Lock,
  Plus,
  Repeat,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Timeline — VISUAL SHELL ONLY (Phase 3b).                           */
/*  Renders a ruler, playhead, source + per-effect tracks with sample   */
/*  parameter rows and keyframe dots. Not connected to rendering or     */
/*  animation — real keyframes arrive with the Animate system.         */
/* ------------------------------------------------------------------ */

const SECONDS = 10;
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
        "inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-lg border px-2.5 text-xs",
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

/** A track lane with keyframe-dot placeholders. */
function Lane({ accent }: { accent: string }) {
  return (
    <div className="relative h-6">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.06]" />
      {[12, 34, 58, 80].map((p, i) => (
        <Diamond
          key={i}
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p}%`, color: accent }}
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
    { name: "Source", accent: "rgba(243,240,232,0.7)", params: [] as string[] },
    ...enabled.map((fx) => ({
      name: fx.name,
      accent: "#FF5A1F",
      params: PARAM_HINTS[fx.type] ?? [],
    })),
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-linen/[0.015]">
      {/* Timeline toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <span className="text-[13px] font-medium text-linen">Timeline</span>
        <span className="rounded bg-flame/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-flame/70">
          Preview
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <ToolbarButton icon={<Plus className="size-3.5" />}>
            Add Keyframe
          </ToolbarButton>
          <ToolbarButton icon={<ChevronDown className="size-3.5" />}>
            Preset Animations
          </ToolbarButton>
          <ToolbarButton active icon={<Repeat className="size-3.5" />}>
            Loop
          </ToolbarButton>
          <ToolbarButton>Range</ToolbarButton>
        </div>
      </div>

      {/* Ruler + tracks */}
      <div className="relative flex min-h-0 flex-1">
        {/* Track labels */}
        <div className="w-36 shrink-0 border-r border-white/[0.06]">
          <div className="h-6 border-b border-white/[0.06]" />
          <div className="scroll-thin max-h-full overflow-y-auto">
            {tracks.map((t) => (
              <div key={t.name} className="px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Eye className="size-3 text-linen/40" />
                  <span className="truncate text-xs font-medium text-linen/80">
                    {t.name}
                  </span>
                  <Lock className="ml-auto size-3 text-linen/25" />
                </div>
                {t.params.map((p) => (
                  <div key={p} className="pl-4 pt-1 text-[10px] text-linen/35">
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Ruler + lanes */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          {/* Ruler */}
          <div className="relative flex h-6 items-end border-b border-white/[0.06]">
            {Array.from({ length: SECONDS + 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-l border-white/[0.05] pl-1 text-[9px] text-linen/30"
              >
                {String(i).padStart(2, "0")}s
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-flame"
            style={{ left: "22%" }}
          >
            <span className="absolute -left-1 -top-0.5 size-2 rounded-sm bg-flame" />
          </div>

          {/* Lanes */}
          <div className="scroll-thin max-h-full overflow-y-auto">
            {tracks.map((t) => (
              <div key={t.name} className="px-2 py-1.5">
                <div className="rounded-md bg-white/[0.015] px-1">
                  <Lane accent={t.accent} />
                </div>
                {t.params.map((p) => (
                  <div key={p} className="px-1 pt-1">
                    <Lane accent="rgba(179,90,60,0.8)" />
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
