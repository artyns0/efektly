import type { LucideIcon } from "lucide-react";
import {
  AlignVerticalJustifyCenter,
  Aperture,
  BarChart2,
  Eye,
  EyeOff,
  Flower,
  FlipHorizontal2,
  Grid2x2,
  Hash,
  Lightbulb,
  Monitor,
  PenTool,
  StretchHorizontal,
  Tv,
  Type,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { STATUS_LABELS } from "../../data/effects";
import type { EffectType } from "../../types/effects";

const EFFECT_ICONS: Record<EffectType, LucideIcon> = {
  dither: Grid2x2,
  ascii: Type,
  glitch: Zap,
  lineArt: PenTool,
  grain: Aperture,
  reflectionGrid: FlipHorizontal2,
  verticalEcho: AlignVerticalJustifyCenter,
  crosshatch: Hash,
  scanStretch: StretchHorizontal,
  pixelSort: BarChart2,
  lightTrails: Wind,
  crtMonitor: Monitor,
  vhsBleed: Tv,
  kaleidoscope: Flower,
  neonEdge: Lightbulb,
};

/**
 * The Effect Stack: five effect categories as selectable, toggleable cards.
 * Clicking a card selects it (its settings show below). The eye toggles the
 * layer's enabled flag. Nothing processes the canvas yet.
 */
export function EffectStack() {
  const effects = useAppStore((s) => s.effects);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);
  const selectEffect = useAppStore((s) => s.selectEffect);
  const toggleEffect = useAppStore((s) => s.toggleEffect);

  return (
    <div className="flex flex-col gap-1.5">
      {effects.map((fx) => {
        const Icon = EFFECT_ICONS[fx.type];
        const selected = fx.id === selectedEffectId;

        return (
          <div
            key={fx.id}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-colors",
              selected
                ? "border-flame/55 bg-flame/[0.08] shadow-[0_10px_28px_-16px_rgba(255,90,31,0.85)]"
                : "border-white/[0.06] bg-linen/[0.025] hover:border-white/[0.12] hover:bg-linen/[0.05]",
            )}
          >
            {/* Select — icon + name + status */}
            <button
              onClick={() => selectEffect(fx.id)}
              aria-pressed={selected}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
                  selected
                    ? "border-flame/40 bg-flame/15 text-flame"
                    : "border-white/[0.07] bg-black/20 text-linen/55",
                  !fx.enabled && "opacity-40",
                )}
              >
                <Icon className="size-4" strokeWidth={1.85} />
              </span>
              <span className="flex min-w-0 items-baseline gap-2">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    fx.enabled ? "text-linen" : "text-linen/45",
                  )}
                >
                  {fx.name}
                </span>
                <span className="shrink-0 text-[10px] text-linen/35">
                  {STATUS_LABELS[fx.status]}
                </span>
              </span>
            </button>

            {/* Enabled toggle — visibility icon */}
            <button
              onClick={() => toggleEffect(fx.id)}
              aria-label={fx.enabled ? `Disable ${fx.name}` : `Enable ${fx.name}`}
              aria-pressed={fx.enabled}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
                fx.enabled
                  ? "text-flame hover:bg-flame/10"
                  : "text-linen/35 hover:bg-linen/[0.06] hover:text-linen/70",
              )}
            >
              {fx.enabled ? (
                <Eye className="size-4" strokeWidth={1.85} />
              ) : (
                <EyeOff className="size-4" strokeWidth={1.85} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
