import type { LucideIcon } from "lucide-react";
import { Bookmark, Image as ImageIcon, Settings, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { RailSection } from "../../types/app";

interface RailItem {
  section: Extract<RailSection, "source" | "effects" | "presets" | "settings">;
  label: string;
  icon: LucideIcon;
  /** Media-scoped tools switch the source back to Media mode. */
  mediaScoped: boolean;
}

const ITEMS: RailItem[] = [
  { section: "source", label: "Source", icon: ImageIcon, mediaScoped: true },
  { section: "effects", label: "Effects", icon: Sparkles, mediaScoped: true },
  { section: "presets", label: "Presets", icon: Bookmark, mediaScoped: true },
  { section: "settings", label: "Settings", icon: Settings, mediaScoped: false },
];

export function PlaygroundRail() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const setMode = useAppStore((s) => s.setMode);

  const isShader = mode === "shader";

  return (
    <nav className="flex h-full w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-linen/[0.02] py-2.5">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        // Settings is global; media tools only highlight when actually in Media.
        const active = item.mediaScoped
          ? !isShader && railSection === item.section
          : railSection === item.section;
        return (
          <button
            key={item.section}
            onClick={() => {
              // Media-scoped tools also return the source to Media mode.
              if (item.mediaScoped && isShader) setMode("media");
              setRailSection(item.section);
            }}
            aria-pressed={active}
            aria-label={item.label}
            title={item.label}
            className={cn(
              "group relative flex w-[52px] flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              active
                ? "bg-flame/[0.14] text-flame shadow-[inset_0_0_0_1px_rgba(255,90,31,0.3)]"
                : "text-linen/55 hover:bg-white/[0.05] hover:text-linen",
            )}
          >
            {active && (
              <span className="absolute -left-[7px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-flame" />
            )}
            <Icon className="size-[18px]" strokeWidth={active ? 2 : 1.85} />
            <span className="text-[9px] font-medium leading-none tracking-wide">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
