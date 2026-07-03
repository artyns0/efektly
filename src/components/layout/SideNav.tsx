import type { LucideIcon } from "lucide-react";
import { Image, Settings, Sparkles, Upload } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import type { AppMode } from "../../types/app";

interface NavItem {
  mode: AppMode;
  label: string;
  icon: LucideIcon;
}

const PRIMARY: NavItem[] = [
  { mode: "media", label: "Media", icon: Image },
  { mode: "shader", label: "Shader", icon: Sparkles },
  { mode: "export", label: "Export", icon: Upload },
];

const SETTINGS_ITEM: NavItem = {
  mode: "settings",
  label: "Settings",
  icon: Settings,
};

function NavButton({ item }: { item: NavItem }) {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const active = mode === item.mode;
  const Icon = item.icon;

  return (
    <button
      onClick={() => setMode(item.mode)}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        "group relative grid size-11 place-items-center rounded-xl transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/60",
        active
          ? "bg-flame/12 text-flame shadow-[0_0_0_1px_rgba(255,90,31,0.25),0_8px_24px_-10px_rgba(255,90,31,0.7)]"
          : "text-linen/45 hover:bg-white/[0.05] hover:text-linen",
      )}
    >
      <Icon className="size-5" strokeWidth={1.9} />
      {active && (
        <span className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-flame" />
      )}
      {/* Tooltip */}
      <span
        className={cn(
          "pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md",
          "border border-white/10 bg-onyx-100 px-2 py-1 text-xs text-linen",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          "z-20",
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

export function SideNav() {
  return (
    <nav className="flex w-16 shrink-0 flex-col items-center border-r border-white/[0.06] py-4">
      <div className="flex flex-col items-center gap-1.5">
        {PRIMARY.map((item) => (
          <NavButton key={item.mode} item={item} />
        ))}
      </div>
      <div className="mt-auto">
        <NavButton item={SETTINGS_ITEM} />
      </div>
    </nav>
  );
}
