import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Film,
  Image as ImageIcon,
  Music,
  Settings,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { RailSection } from "../../types/app";

interface RailItem {
  section: RailSection;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}

const ITEMS: RailItem[] = [
  { section: "source", label: "Source", icon: ImageIcon },
  { section: "effects", label: "Effects", icon: Sparkles },
  { section: "animate", label: "Animate", icon: Film },
  { section: "text", label: "Text", icon: Type, soon: true },
  { section: "shapes", label: "Shapes", icon: Shapes, soon: true },
  { section: "audio", label: "Audio", icon: Music, soon: true },
  { section: "presets", label: "Presets", icon: Bookmark },
  { section: "settings", label: "Settings", icon: Settings },
];

export function PlaygroundRail() {
  const railSection = useAppStore((s) => s.railSection);
  const setRailSection = useAppStore((s) => s.setRailSection);

  return (
    <nav className="flex h-full w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-linen/[0.02] py-2.5">
      {ITEMS.map((item) => {
        const active = railSection === item.section;
        const Icon = item.icon;
        return (
          <button
            key={item.section}
            onClick={() => !item.soon && setRailSection(item.section)}
            disabled={item.soon}
            aria-pressed={active}
            aria-label={item.label}
            title={item.soon ? `${item.label} — coming soon` : item.label}
            className={cn(
              "group relative flex w-[52px] flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              active
                ? "bg-flame/[0.14] text-flame shadow-[inset_0_0_0_1px_rgba(255,90,31,0.3)]"
                : item.soon
                  ? "cursor-not-allowed text-linen/25"
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
            {item.soon && (
              <span className="rounded-full bg-white/[0.05] px-1 text-[7px] font-medium uppercase leading-[1.4] tracking-wider text-linen/30">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
