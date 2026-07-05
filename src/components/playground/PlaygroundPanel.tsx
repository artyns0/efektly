import { Eye, HelpCircle, MoreHorizontal, Plus, Star } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { MediaSource } from "../media/MediaSource";
import { SettingsPanel } from "../panels/SettingsPanel";
import { EffectAccordion } from "./EffectAccordion";
import { ShaderControls } from "./ShaderControls";
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 shadow-sm">
      {children}
    </div>
  );
}

/** Small procedural preset thumbnail (placeholder art). */
function PresetThumb({ seed }: { seed: number }) {
  const hue = 18 + seed * 4;
  return (
    <span
      className="size-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08]"
      style={{
        background: `radial-gradient(80% 80% at 30% 20%, hsla(${hue},70%,55%,0.28), transparent 60%), linear-gradient(150deg,#1c1712,#0c0c0c)`,
      }}
    />
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
      <div className="flex flex-col gap-3.5">
        <SectionHeader title="Settings" />
        <SettingsPanel />
      </div>
    );
  }
  if (railSection === "help") {
    return (
      <div className="flex flex-col gap-3.5">
        <SectionHeader title="Help" />
        <Card>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <HelpCircle className="size-6 text-linen/30" strokeWidth={1.6} />
            <p className="text-sm text-linen/60">Docs &amp; shortcuts</p>
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
      <div className="flex flex-col gap-3.5">
        <SectionHeader title="Presets" />
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
        <Card>
          <div className="flex items-center gap-3">
            <Eye className="size-4 shrink-0 text-linen/50" />
            <div
              className="size-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.1] bg-black/40"
              style={
                mediaUrl
                  ? undefined
                  : {
                      background:
                        "radial-gradient(90% 90% at 40% 20%, rgba(255,90,31,0.25), transparent 60%), linear-gradient(150deg,#1a1512,#0b0b0b)",
                    }
              }
            >
              {mediaUrl && (
                <img
                  src={mediaUrl}
                  alt=""
                  className="size-full object-cover"
                />
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
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Presets"
          action={
            <span className="cursor-default text-[11px] font-medium text-linen/35 hover:text-linen/55">
              View all
            </span>
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
      {PLACEHOLDER_PRESETS.map((p, i) => (
        <button
          key={p}
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] px-2.5 py-2 text-left transition-colors"
        >
          <PresetThumb seed={i} />
          <span className="flex-1 truncate text-[13px] text-linen/75">{p}</span>
          <Star className="size-3.5 text-linen/25" />
        </button>
      ))}
    </div>
  );
}
