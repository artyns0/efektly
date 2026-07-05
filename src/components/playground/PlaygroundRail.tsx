import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Box,
  Grid2x2,
  HelpCircle,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

/* Playground v2 rail: Source · Effects · Shader · Presets · Settings · Help.
   Active = thin flame bar + subtle bg + white icon/text. */

type RailKey = "source" | "effects" | "shader" | "presets" | "settings" | "help";

const ITEMS: { key: RailKey; label: string; icon: LucideIcon }[] = [
  { key: "source", label: "Source", icon: ImageIcon },
  { key: "effects", label: "Effects", icon: Grid2x2 },
  { key: "shader", label: "Shader", icon: Box },
  { key: "presets", label: "Presets", icon: Bookmark },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "help", label: "Help", icon: HelpCircle },
];

export function PlaygroundRail() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const setMode = useAppStore((s) => s.setMode);

  const isShader = mode === "shader";
  const isActive = (key: RailKey) => {
    if (key === "shader") return isShader;
    if (key === "settings" || key === "help") return railSection === key;
    return !isShader && railSection === key;
  };

  const navigate = (key: RailKey) => {
    if (key === "shader") {
      setMode("shader");
      return;
    }
    if (key === "source" || key === "effects" || key === "presets") {
      if (isShader) setMode("media");
    }
    setRailSection(key);
  };

  return (
    <nav className="flex h-full w-16 shrink-0 flex-col items-center rounded-2xl border border-white/[0.06] bg-linen/[0.02] py-2.5">
      <div className="flex flex-col items-center gap-1.5">
        {ITEMS.slice(0, 4).map((item) => (
          <RailButton key={item.key} item={item} active={isActive(item.key)} onClick={() => navigate(item.key)} />
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-1.5">
        {ITEMS.slice(4).map((item) => (
          <RailButton key={item.key} item={item} active={isActive(item.key)} onClick={() => navigate(item.key)} />
        ))}
      </div>
    </nav>
  );
}

function RailButton({
  item,
  active,
  onClick,
}: {
  item: { key: RailKey; label: string; icon: LucideIcon };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={item.label}
      title={item.label}
      className={cn(
        "relative flex w-[52px] flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
        active
          ? "bg-white/[0.06] text-linen"
          : "text-linen/50 hover:bg-white/[0.04] hover:text-linen",
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
}
