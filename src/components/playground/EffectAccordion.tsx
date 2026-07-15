import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Aperture,
  BarChart2,
  Eye,
  Flower,
  FlipHorizontal2,
  GripVertical,
  Grid2x2,
  Hash,
  Layers,
  LayoutGrid,
  Lightbulb,
  Monitor,
  PenTool,
  ScanEye,
  Plus,
  Sparkles,
  StretchHorizontal,
  Trash2,
  Tv,
  Type,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { EffectType } from "../../types/effects";
import { emitFlapReaction } from "../../lib/flapEvents";

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
  ledScan: LayoutGrid,
  nightVision: Eye,
  inverseStrobe: Sparkles,
  motionTrails: Waves,
  slitScan: AlignHorizontalJustifyCenter,
  opticalGlass: Aperture,
  visionTracker: ScanEye,
};

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

/**
 * Compact "Active Effects" stack for the left panel. Rows show name +
 * selection + enable toggle only — detailed controls live in the right
 * Properties panel. "Add Effect" enables an effect from the available list.
 */
export function EffectAccordion() {
  const effects = useAppStore((s) => s.effects);
  const stackedEffectIds = useAppStore((s) => s.stackedEffectIds);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);
  const selectEffect = useAppStore((s) => s.selectEffect);
  const toggleEffect = useAppStore((s) => s.toggleEffect);
  const addToStack = useAppStore((s) => s.addToStack);
  const removeFromStack = useAppStore((s) => s.removeFromStack);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const [menuOpen, setMenuOpen] = useState(false);

  // Stack membership is independent of enabled: a stacked effect stays in the
  // list even when toggled off.
  const active = effects.filter((fx) => stackedEffectIds.includes(fx.id));
  const available = effects.filter((fx) => !stackedEffectIds.includes(fx.id));

  const pick = (id: string) => {
    selectEffect(id);
    setRightTab("properties");
  };

  const addEffect = (id: string) => {
    addToStack(id);
    pick(id);
    setMenuOpen(false);
    emitFlapReaction("wow");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative flex items-center justify-between px-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
            Active Effects
          </span>
          <span className="font-mono text-[10px] text-linen/30">
            {active.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          disabled={available.length === 0}
          aria-expanded={menuOpen}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors",
            available.length === 0
              ? "cursor-not-allowed border-white/[0.08] text-linen/30"
              : "border-flame/40 bg-flame/10 text-flame hover:bg-flame/15",
          )}
        >
          <Plus className="size-3.5" />
          Add Effect
        </button>

        {/* Add menu */}
        {menuOpen && available.length > 0 && (
          <div className="scroll-thin absolute right-0 top-9 z-20 max-h-72 w-56 overflow-y-auto rounded-xl border border-white/[0.1] bg-onyx-100 p-1.5 shadow-2xl shadow-black/50">
            {available.map((fx) => {
              const Icon = EFFECT_ICONS[fx.type];
              return (
                <button
                  key={fx.id}
                  type="button"
                  onClick={() => addEffect(fx.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-linen/75 transition-colors hover:bg-white/[0.06] hover:text-linen"
                >
                  <Icon className="size-4 shrink-0 text-linen/50" strokeWidth={1.8} />
                  {fx.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-white/[0.1] bg-linen/[0.015] px-4 py-10 text-center">
          <Layers className="size-6 text-linen/25" strokeWidth={1.5} />
          <p className="text-[13px] font-medium text-linen/70">
            No effects added yet
          </p>
          <p className="text-xs text-linen/40">Use Add Effect to start stylizing.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {active.map((fx) => {
            const Icon = EFFECT_ICONS[fx.type];
            const selected = fx.id === selectedEffectId;
            return (
              <div
                key={fx.id}
                className={cn(
                  "group relative flex items-center gap-1.5 rounded-xl border py-2 pl-1.5 pr-1.5 shadow-sm transition-colors",
                  selected
                    ? "border-flame/50 bg-flame/[0.08] shadow-flame/5"
                    : fx.enabled
                      ? "border-white/[0.1] bg-white/[0.035] hover:border-white/[0.18]"
                      : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]",
                )}
              >
                <GripVertical
                  className="size-4 shrink-0 cursor-grab text-linen/20"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => pick(fx.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
                      selected
                        ? "border-flame/40 bg-flame/15 text-flame"
                        : fx.enabled
                          ? "border-white/[0.09] bg-black/25 text-linen/70"
                          : "border-white/[0.06] bg-black/20 text-linen/35",
                    )}
                  >
                    <Icon className="size-[16px]" strokeWidth={1.85} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        "truncate text-[13px] font-medium leading-tight",
                        fx.enabled ? "text-linen" : "text-linen/50",
                      )}
                    >
                      {fx.name}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-medium uppercase tracking-wide leading-tight",
                        fx.enabled ? "text-flame/70" : "text-linen/30",
                      )}
                    >
                      {fx.enabled ? "On" : "Off"}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${fx.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromStack(fx.id);
                  }}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-linen/30 opacity-0 transition hover:bg-white/[0.08] hover:text-linen/70 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <Switch
                  on={fx.enabled}
                  onClick={() => toggleEffect(fx.id)}
                  label={fx.enabled ? `Disable ${fx.name}` : `Enable ${fx.name}`}
                />
              </div>
            );
          })}
        </div>
      )}

      <p className="px-1 text-[10px] text-linen/25">
        Select an effect to edit its settings in Properties.
      </p>
    </div>
  );
}
