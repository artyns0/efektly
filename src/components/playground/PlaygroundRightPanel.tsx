import type { LucideIcon } from "lucide-react";
import {
  AlignVerticalJustifyCenter,
  Aperture,
  BarChart2,
  Flower,
  FlipHorizontal2,
  Grid2x2,
  Hash,
  Lightbulb,
  MonitorPlay,
  Monitor,
  MousePointerSquareDashed,
  PenTool,
  StretchHorizontal,
  Tv,
  Type,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { EffectType } from "../../types/effects";
import { ExportPanel } from "../panels/ExportPanel";
import { VideoRecordButton } from "./VideoRecordButton";
import { EffectControlsSwitch } from "./EffectControlsSwitch";
import { SHADER_TYPES } from "../../data/shaders";

/* Playground v2 right panel: Properties / Export tabs. Properties shows the
   settings for the single selected item (effect / shader / source) — no
   duplicated effects list. Export reuses the existing ExportPanel. */

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

function PropertyHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-flame/30 bg-flame/10 text-flame">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-linen">{title}</span>
        <span className="text-[10px] uppercase tracking-wide text-linen/40">
          {subtitle}
        </span>
      </span>
    </div>
  );
}

function EmptyProperties() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.1] bg-linen/[0.015] px-4 py-12 text-center">
      <MousePointerSquareDashed className="size-6 text-linen/25" strokeWidth={1.5} />
      <p className="text-[13px] font-medium text-linen/70">No selection</p>
      <p className="text-xs text-linen/40">
        Select a layer, effect, or shader to edit properties.
      </p>
    </div>
  );
}

function PropertiesTab() {
  const mode = useAppStore((s) => s.mode);
  const shaderType = useAppStore((s) => s.shaderType);
  const effects = useAppStore((s) => s.effects);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);

  // Shader mode → show the active shader as the selected item.
  if (mode === "shader") {
    const label = SHADER_TYPES.find((t) => t.id === shaderType)?.label ?? "Shader";
    return (
      <div className="flex flex-col gap-3">
        <PropertyHeader icon={MonitorPlay} title={label} subtitle="Shader" />
        <p className="rounded-xl border border-white/[0.05] bg-linen/[0.02] px-3 py-2.5 text-xs text-linen/50">
          Adjust shader parameters in the Shader panel on the left.
        </p>
      </div>
    );
  }

  // Media mode → show the selected effect's controls, if it is active.
  const selected = effects.find(
    (fx) => fx.id === selectedEffectId && fx.enabled,
  );
  if (!selected) return <EmptyProperties />;

  const Icon = EFFECT_ICONS[selected.type];
  return (
    <div className="flex flex-col gap-3">
      <PropertyHeader icon={Icon} title={selected.name} subtitle="Effect" />
      <div className="rounded-2xl border border-white/[0.06] bg-linen/[0.015] p-3">
        <EffectControlsSwitch effect={selected} />
      </div>
    </div>
  );
}

export function PlaygroundRightPanel() {
  const rightTab = useAppStore((s) => s.rightTab);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const projectName = useAppStore((s) => s.projectName);

  return (
    <div className="flex flex-col gap-3 pt-1">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] px-1 pb-0">
        {(["properties", "export"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={rightTab === t}
            onClick={() => setRightTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm font-medium capitalize transition-colors",
              rightTab === t
                ? "border-flame text-linen"
                : "border-transparent text-linen/45 hover:text-linen",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {rightTab === "properties" ? (
        <PropertiesTab />
      ) : (
        <div className="flex flex-col gap-4">
          <ExportPanel videoRecordAction={<VideoRecordButton />} />
          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-linen/[0.02] px-3 py-2 text-sm">
            <span className="text-linen/55">Project</span>
            <span className="truncate font-mono text-xs text-linen/60">
              {projectName || "Untitled Project"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
