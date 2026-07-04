import type { ReactNode } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { MediaSource } from "../media/MediaSource";
import { SettingsPanel } from "../panels/SettingsPanel";
import { EffectAccordion } from "./EffectAccordion";
import { ShaderControls } from "./ShaderControls";

function PanelHeader({ title }: { title: string }) {
  return (
    <span className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
      {title}
    </span>
  );
}

function StubButton({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl",
        "border border-dashed border-white/[0.1] bg-white/[0.02] text-sm text-linen/45",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function PlaygroundPanel() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);

  // Settings is global — available in Media and Shader modes.
  if (railSection === "settings") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Settings" />
        <SettingsPanel />
      </div>
    );
  }

  // In Shader mode the panel shows procedural shader controls.
  if (mode === "shader") {
    return <ShaderControls />;
  }

  // Media mode — rail selects the section.
  if (railSection === "source") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Source" />
        <MediaSource />
      </div>
    );
  }

  if (railSection === "presets") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Presets" />
        <p className="px-1 text-xs text-linen/35">
          Save and reuse full effect looks.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {["Neon Drift", "Ink Poster", "VHS Night", "Halftone Pop"].map((p) => (
            <div
              key={p}
              className="flex h-16 items-end rounded-xl border border-white/[0.06] bg-linen/[0.02] p-2.5 text-xs text-linen/50"
            >
              {p}
            </div>
          ))}
        </div>
        <StubButton icon={<Bookmark className="size-4" />}>
          Save Current Look
        </StubButton>
        <StubButton>Load Preset</StubButton>
      </div>
    );
  }

  // Default: Effects.
  return <EffectAccordion />;
}
