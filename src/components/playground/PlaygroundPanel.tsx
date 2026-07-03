import type { ReactNode } from "react";
import { Bookmark, Film, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { MediaSource } from "../media/MediaSource";
import { SettingsPanel } from "../panels/SettingsPanel";
import { EffectAccordion } from "./EffectAccordion";

function PanelHeader({ title }: { title: string }) {
  return (
    <span className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
      {title}
    </span>
  );
}

/** Disabled stub control row for shell-only sections. */
function StubRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5 text-sm">
      <span className="text-linen/60">{label}</span>
      <span className="font-mono text-xs text-linen/40">{value ?? "—"}</span>
    </div>
  );
}

function StubButton({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
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

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-white/[0.08] bg-linen/[0.015] p-6 text-center">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-sm font-medium text-linen/70">{title}</span>
        <span className="text-xs text-linen/35">Coming soon</span>
      </div>
    </div>
  );
}

export function PlaygroundPanel() {
  const railSection = useAppStore((s) => s.railSection);

  if (railSection === "source") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Source" />
        <MediaSource />
      </div>
    );
  }

  if (railSection === "effects") {
    return <EffectAccordion />;
  }

  if (railSection === "animate") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Animate" />
        <p className="px-1 text-xs text-linen/35">
          Keyframe timeline arrives in a later step.
        </p>
        <StubRow label="Duration" value="00:10:00" />
        <StubRow label="FPS" value="60 fps" />
        <StubRow label="Loop" value="On" />
        <StubButton icon={<Plus className="size-4" />}>Add Keyframe</StubButton>
        <StubButton icon={<Film className="size-4" />}>Preset Animations</StubButton>
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

  if (railSection === "settings") {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Settings" />
        <SettingsPanel />
      </div>
    );
  }

  // text / shapes / audio (rail-disabled, but handle gracefully)
  const titles: Record<string, string> = {
    text: "Text",
    shapes: "Shapes",
    audio: "Audio",
  };
  return <ComingSoon title={titles[railSection] ?? "Section"} />;
}
