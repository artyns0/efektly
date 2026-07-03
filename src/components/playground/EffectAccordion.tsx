import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignVerticalJustifyCenter,
  Aperture,
  ChevronDown,
  FlipHorizontal2,
  Grid2x2,
  PenTool,
  Plus,
  Type,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { EffectInstance, EffectType } from "../../types/effects";
import { DitherControls } from "../panels/effects/DitherControls";
import { AsciiControls } from "../panels/effects/AsciiControls";
import { GlitchControls } from "../panels/effects/GlitchControls";
import { LineArtControls } from "../panels/effects/LineArtControls";
import { GrainControls } from "../panels/effects/GrainControls";
import { ReflectionGridControls } from "../panels/effects/ReflectionGridControls";
import { VerticalEchoControls } from "../panels/effects/VerticalEchoControls";

const EFFECT_ICONS: Record<EffectType, LucideIcon> = {
  dither: Grid2x2,
  ascii: Type,
  glitch: Zap,
  lineArt: PenTool,
  grain: Aperture,
  reflectionGrid: FlipHorizontal2,
  verticalEcho: AlignVerticalJustifyCenter,
};

/** Renders the matching control set for an effect (reuses existing panels). */
function EffectControls({ effect }: { effect: EffectInstance }) {
  switch (effect.type) {
    case "dither":
      return <DitherControls effect={effect} />;
    case "ascii":
      return <AsciiControls effect={effect} />;
    case "glitch":
      return <GlitchControls effect={effect} />;
    case "lineArt":
      return <LineArtControls effect={effect} />;
    case "grain":
      return <GrainControls effect={effect} />;
    case "reflectionGrid":
      return <ReflectionGridControls effect={effect} />;
    case "verticalEcho":
      return <VerticalEchoControls effect={effect} />;
    default:
      return null;
  }
}

/** Compact pill switch for enable/disable. */
function Switch({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
        on ? "bg-flame" : "bg-white/[0.14]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-3.5 rounded-full bg-linen shadow transition-all",
          on ? "left-[15px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function EffectAccordion() {
  const effects = useAppStore((s) => s.effects);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);
  const selectEffect = useAppStore((s) => s.selectEffect);
  const toggleEffect = useAppStore((s) => s.toggleEffect);
  const [expanded, setExpanded] = useState<string | null>(selectedEffectId);

  const enabledCount = effects.filter((fx) => fx.enabled).length;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
            Effects
          </span>
          <span className="font-mono text-[10px] text-linen/30">
            {enabledCount}/{effects.length} on
          </span>
        </div>
        <button
          type="button"
          disabled
          title="All effects are in the stack"
          className="inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-2.5 text-xs text-linen/45"
        >
          <Plus className="size-3.5" />
          Add Effect
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {effects.map((fx) => {
          const Icon = EFFECT_ICONS[fx.type];
          const isOpen = expanded === fx.id;
          const selected = fx.id === selectedEffectId;

          return (
            <div
              key={fx.id}
              className={cn(
                "relative overflow-hidden rounded-xl border transition-colors",
                selected
                  ? "border-flame/45 bg-flame/[0.07]"
                  : fx.enabled
                    ? "border-white/[0.1] bg-linen/[0.03]"
                    : "border-white/[0.05] bg-linen/[0.015]",
              )}
            >
              {/* Enabled accent bar */}
              {fx.enabled && (
                <span className="absolute inset-y-0 left-0 w-[3px] bg-flame/80" />
              )}

              {/* Header row */}
              <button
                type="button"
                onClick={() => {
                  selectEffect(fx.id);
                  setExpanded(isOpen ? null : fx.id);
                }}
                className="flex w-full items-center gap-2 py-[7px] pl-2.5 pr-2 text-left focus-visible:outline-none"
              >
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 text-linen/35 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
                <span
                  className={cn(
                    "grid size-[26px] shrink-0 place-items-center rounded-lg border transition-colors",
                    fx.enabled
                      ? "border-flame/40 bg-flame/15 text-flame"
                      : "border-white/[0.07] bg-black/20 text-linen/45",
                  )}
                >
                  <Icon className="size-[15px]" strokeWidth={1.85} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "truncate text-[13px] font-medium leading-tight",
                      fx.enabled ? "text-linen" : "text-linen/45",
                    )}
                  >
                    {fx.name}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] leading-tight",
                      fx.enabled ? "text-flame/70" : "text-linen/30",
                    )}
                  >
                    {fx.enabled ? "Active" : "Off"}
                  </span>
                </span>
                <Switch
                  on={fx.enabled}
                  onClick={() => toggleEffect(fx.id)}
                  label={fx.enabled ? `Disable ${fx.name}` : `Enable ${fx.name}`}
                />
              </button>

              {/* Expanded controls */}
              {isOpen && (
                <div className="border-t border-white/[0.06] px-3 py-3">
                  <EffectControls effect={fx} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
