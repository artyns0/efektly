import { Box, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { ExportPanel } from "../panels/ExportPanel";
import { VideoRecordButton } from "./VideoRecordButton";
import { SHADER_TYPES } from "../../data/shaders";

/* Playground v2 right panel: Properties / Export tabs. Export reuses the
   existing ExportPanel; Properties is a summary (transform = placeholder,
   effects toggles = functional). */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-linen/[0.02] px-3 py-2 text-sm">
      <span className="text-linen/55">{label}</span>
      <span className="font-mono text-xs text-linen/60">{value}</span>
    </div>
  );
}

function PropertiesTab() {
  const mode = useAppStore((s) => s.mode);
  const source = useAppStore((s) => s.source);
  const mediaUrl = useAppStore((s) => s.mediaUrl);
  const shaderType = useAppStore((s) => s.shaderType);
  const effects = useAppStore((s) => s.effects);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);
  const toggleEffect = useAppStore((s) => s.toggleEffect);
  const selectEffect = useAppStore((s) => s.selectEffect);

  const isShader = mode === "shader";
  const selectedName = isShader
    ? SHADER_TYPES.find((t) => t.id === shaderType)?.label ?? "Shader"
    : mediaUrl
      ? source.name
      : "No source";
  const enabled = effects.filter((fx) => fx.enabled);

  return (
    <div className="flex flex-col gap-4">
      {/* Selected item */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-black/30 text-linen/60">
          <Box className="size-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-linen">
          {selectedName}
        </span>
        <MoreHorizontal className="size-4 shrink-0 text-linen/35" />
      </div>

      {/* Transform — placeholder */}
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-medium text-linen/50">Transform</span>
        <Row label="Position" value="X 0 · Y 0" />
        <Row label="Scale" value="X 100% · Y 100%" />
        <Row label="Rotation" value="0°" />
        <Row label="Anchor" value="X 0 · Y 0" />
        <p className="px-1 text-[10px] text-linen/30">Transform arrives later.</p>
      </div>

      {/* Effects summary — functional toggles */}
      {!isShader && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-linen/50">
              Effects ({enabled.length})
            </span>
            <Plus className="size-3.5 text-linen/30" />
          </div>
          {effects.map((fx) => (
            <div
              key={fx.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2",
                fx.id === selectedEffectId
                  ? "border-white/[0.14] bg-white/[0.04]"
                  : "border-white/[0.05] bg-linen/[0.015]",
              )}
            >
              <button
                type="button"
                onClick={() => selectEffect(fx.id)}
                className="min-w-0 flex-1 truncate text-left text-[13px] text-linen/80 focus-visible:outline-none"
              >
                {fx.name}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={fx.enabled}
                aria-label={fx.enabled ? `Disable ${fx.name}` : `Enable ${fx.name}`}
                onClick={() => toggleEffect(fx.id)}
                className={cn(
                  "relative h-[16px] w-7 shrink-0 rounded-full transition-colors",
                  fx.enabled ? "bg-flame" : "bg-white/[0.14]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-3 rounded-full bg-linen shadow transition-all",
                    fx.enabled ? "left-[13px]" : "left-0.5",
                  )}
                />
              </button>
            </div>
          ))}
          <Row label="Blend Mode" value="Normal" />
          <Row label="Opacity" value="100%" />
        </div>
      )}
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
