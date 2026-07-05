import { Eye, MoreHorizontal, Plus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { MediaSource } from "../media/MediaSource";
import { SettingsPanel } from "../panels/SettingsPanel";
import { EffectAccordion } from "./EffectAccordion";
import { ShaderControls } from "./ShaderControls";
import { ThreePanel } from "../panels/ThreePanel";
import { SHADER_TYPES } from "../../data/shaders";

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-linen/45">
        {title}
      </span>
      {action}
    </div>
  );
}

export function PlaygroundPanel() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const source = useAppStore((s) => s.source);
  const mediaUrl = useAppStore((s) => s.mediaUrl);
  const shaderType = useAppStore((s) => s.shaderType);

  // Settings (opened from the toolbar).
  if (mode !== "shader" && railSection === "settings") {
    return (
      <div className="flex flex-col gap-3.5">
        <SectionHeader title="Settings" />
        <SettingsPanel />
      </div>
    );
  }

  // 3D tab → 3D objects list only.
  if (mode === "three") return <ThreePanel />;

  // Shader tab → shader controls only.
  if (mode === "shader") return <ShaderControls />;

  // Effects tab → active effects stack only.
  if (railSection === "effects") return <EffectAccordion />;

  // Source tab (default) → upload + layers.
  const layerName = mediaUrl
    ? source.name
    : mode === "media"
      ? "No media"
      : SHADER_TYPES.find((t) => t.id === shaderType)?.label ?? "Shader";
  const layerMeta = mediaUrl ? `${source.width} × ${source.height}` : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionHeader title="Source" />
        <MediaSource variant="hero" />
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Layers"
          action={
            <button
              type="button"
              disabled
              aria-label="Add layer"
              className="grid size-6 cursor-not-allowed place-items-center rounded-lg border border-white/[0.1] text-linen/40"
            >
              <Plus className="size-3.5" />
            </button>
          }
        />
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#141414] p-3">
          <Eye className="size-4 shrink-0 text-linen/50" />
          <div
            className="size-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.1] bg-black/50"
          >
            {mediaUrl && (
              <img src={mediaUrl} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-linen">
              {layerName}
            </p>
            <p className="font-mono text-[10px] text-linen/45">{layerMeta}</p>
          </div>
          <MoreHorizontal className="size-4 shrink-0 text-linen/40" />
        </div>
      </div>
    </div>
  );
}
