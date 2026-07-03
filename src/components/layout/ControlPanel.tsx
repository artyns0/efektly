import { useAppStore } from "../../store/useAppStore";
import { MediaPanel } from "../panels/MediaPanel";
import { ShaderPanel } from "../panels/ShaderPanel";
import { ExportPanel } from "../panels/ExportPanel";
import { SettingsPanel } from "../panels/SettingsPanel";

const TITLES: Record<string, string> = {
  media: "Media",
  shader: "Shader",
  export: "Export",
  settings: "Settings",
};

export function ControlPanel() {
  const mode = useAppStore((s) => s.mode);

  return (
    <aside className="relative flex w-[400px] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-gradient-to-b from-onyx-100/55 to-onyx-50/35 backdrop-blur-2xl">
      {/* glass top highlight — a hairline of light along the upper edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-linen/12 to-transparent"
      />
      {/* inner sheen — subtle vertical lift so the panel reads as frosted glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(243,240,232,0.035) 0%, transparent 18%, transparent 86%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {/* warm ambient glow at the top of the panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44"
        style={{
          background:
            "radial-gradient(130% 100% at 28% 0%, rgba(255,90,31,0.09), transparent 68%)",
        }}
      />

      <div className="relative flex h-13 shrink-0 items-center px-6 pt-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-linen/40">
          {TITLES[mode]}
        </span>
      </div>

      <div className="scroll-thin relative flex-1 overflow-y-auto px-4 pb-10 pt-1">
        {mode === "media" && <MediaPanel />}
        {mode === "shader" && <ShaderPanel />}
        {mode === "export" && <ExportPanel />}
        {mode === "settings" && <SettingsPanel />}
      </div>
    </aside>
  );
}
