import { Eye, HelpCircle, MoreHorizontal, Plus, Star } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { MediaSource } from "../media/MediaSource";
import { SettingsPanel } from "../panels/SettingsPanel";
import { EffectAccordion } from "./EffectAccordion";
import { ShaderControls } from "./ShaderControls";
import { SHADER_TYPES } from "../../data/shaders";

function PanelHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-[13px] font-medium text-linen">{title}</span>
      {action}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-linen/[0.015] p-3">
      {children}
    </div>
  );
}

const PLACEHOLDER_PRESETS = [
  "Noise Field",
  "Wireframe",
  "Particle Flow",
  "Dot Matrix",
  "Liquid",
];

export function PlaygroundPanel() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const source = useAppStore((s) => s.source);
  const mediaUrl = useAppStore((s) => s.mediaUrl);
  const shaderType = useAppStore((s) => s.shaderType);

  // Global sections first.
  if (railSection === "settings") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Settings" />
        <SettingsPanel />
      </div>
    );
  }
  if (railSection === "help") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Help" />
        <Card>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <HelpCircle className="size-6 text-linen/30" strokeWidth={1.6} />
            <p className="text-sm text-linen/60">Docs & shortcuts</p>
            <p className="text-xs text-linen/35">Coming soon</p>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === "shader") return <ShaderControls />;

  if (railSection === "effects") return <EffectAccordion />;

  if (railSection === "presets") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Presets" />
        <PresetList />
      </div>
    );
  }

  // Source (default): upload + layers + presets stack.
  const layerName =
    mode === "media"
      ? mediaUrl
        ? source.name
        : "No media"
      : SHADER_TYPES.find((t) => t.id === shaderType)?.label ?? "Shader";
  const layerMeta = mediaUrl ? `${source.width} × ${source.height}` : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <PanelHeader title="Source" />
        <MediaSource />
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelHeader
          title="Layers"
          action={
            <button
              type="button"
              disabled
              aria-label="Add layer"
              className="grid size-6 cursor-not-allowed place-items-center rounded-lg border border-white/[0.08] text-linen/40"
            >
              <Plus className="size-3.5" />
            </button>
          }
        />
        <Card>
          <div className="flex items-center gap-2.5">
            <Eye className="size-3.5 shrink-0 text-linen/45" />
            <div className="size-9 shrink-0 rounded-lg border border-white/[0.08] bg-black/30" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-linen">
                {layerName}
              </p>
              <p className="font-mono text-[10px] text-linen/40">{layerMeta}</p>
            </div>
            <MoreHorizontal className="size-4 shrink-0 text-linen/35" />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelHeader
          title="Presets"
          action={
            <span className="text-[11px] text-linen/35">View all</span>
          }
        />
        <PresetList />
      </div>
    </div>
  );
}

function PresetList() {
  return (
    <div className="flex flex-col gap-1.5">
      {PLACEHOLDER_PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-2.5 rounded-xl border border-white/[0.05] bg-linen/[0.015] px-2.5 py-2 text-left"
        >
          <span className="size-9 shrink-0 rounded-lg border border-white/[0.07] bg-black/40" />
          <span className="flex-1 truncate text-[13px] text-linen/70">{p}</span>
          <Star className="size-3.5 text-linen/25" />
        </button>
      ))}
    </div>
  );
}
