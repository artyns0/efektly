import {
  Box,
  Boxes,
  Camera,
  ChevronDown,
  Circle,
  Grid2x2,
  Pause,
  Play,
  Redo2,
  Settings,
  Sparkles,
  Square,
  Undo2,
  Upload,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../controls/Button";
import { Logo } from "../layout/Logo";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureRecord } from "../../hooks/useCaptureRecord";
import { formatClock } from "../../utils/time";
import type { Orientation } from "../../types/app";

/* Playground v2 toolbar: logo · project name · Source/Effects/Shader nav ·
   undo/redo · aspect · play · capture · record · Export. */

const ASPECTS: { value: Orientation; label: string }[] = [
  { value: "horizontal", label: "16:9" },
  { value: "vertical", label: "9:16" },
  { value: "square", label: "1:1" },
];

type NavKey = "source" | "effects" | "shader" | "three";
const NAV: { key: NavKey; label: string; icon: typeof Sparkles }[] = [
  { key: "source", label: "Source", icon: Sparkles },
  { key: "effects", label: "Effects", icon: Grid2x2 },
  { key: "shader", label: "Shader", icon: Box },
  { key: "three", label: "3D", icon: Boxes },
];

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-linen/70 transition-colors hover:bg-white/[0.06] hover:text-linen disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export function PlaygroundToolbar() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const railSection = useAppStore((s) => s.railSection);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const setExportPanelOpen = useAppStore((s) => s.setExportPanelOpen);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const orientation = useAppStore((s) => s.orientation);
  const setOrientation = useAppStore((s) => s.setOrientation);
  const projectName = useAppStore((s) => s.projectName);
  const setProjectName = useAppStore((s) => s.setProjectName);
  const tlPlaying = useAppStore((s) => s.tlPlaying);
  const setTlPlaying = useAppStore((s) => s.setTlPlaying);

  const { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord } =
    useCaptureRecord({
      onResult: () => {
        setExportPanelOpen(true);
        setRightTab("export");
      },
    });

  const active: NavKey | null =
    mode === "shader"
      ? "shader"
      : mode === "three"
        ? "three"
        : railSection === "source"
          ? "source"
          : railSection === "effects"
            ? "effects"
            : null;

  const openSettings = () => {
    setMode("media");
    setRailSection("settings");
  };

  const navigate = (key: NavKey) => {
    if (key === "shader") {
      setMode("shader");
    } else if (key === "three") {
      setMode("three");
    } else {
      setMode("media");
      setRailSection(key);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
      {/* Brand + slogan + project name */}
      <div className="flex min-w-0 items-center gap-3">
        <Logo />
        <span className="flex flex-col leading-none">
          <span className="text-[18px] font-semibold tracking-tight text-linen">
            Efektly
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-linen/40">
            Upload. Stylize. Export.
          </span>
        </span>
        <span className="mx-1 h-6 w-px bg-white/[0.08]" />
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          aria-label="Project name"
          className="w-44 truncate rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-linen/85 transition-colors hover:border-white/[0.08] focus:border-white/[0.16] focus:outline-none"
        />
      </div>

      {/* Center nav */}
      <div className="flex flex-1 justify-center">
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1">
          {NAV.map((n) => {
            const is = active === n.key;
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                role="tab"
                aria-selected={is}
                onClick={() => navigate(n.key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all",
                  is
                    ? "bg-white/[0.08] text-linen shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-linen/55 hover:text-linen",
                )}
              >
                <Icon className={cn("size-4", is && "text-flame")} strokeWidth={1.9} />
                {n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5">
        <IconButton label="Undo" disabled>
          <Undo2 className="size-4" strokeWidth={1.8} />
        </IconButton>
        <IconButton label="Redo" disabled>
          <Redo2 className="size-4" strokeWidth={1.8} />
        </IconButton>
        <IconButton label="Settings" onClick={openSettings}>
          <Settings className="size-4" strokeWidth={1.8} />
        </IconButton>

        <label className="relative ml-1">
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as Orientation)}
            aria-label="Aspect ratio"
            className="h-9 appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] pl-3 pr-8 text-sm text-linen/80 transition-colors hover:bg-white/[0.06] focus:outline-none"
          >
            {ASPECTS.map((a) => (
              <option key={a.value} value={a.value} className="bg-onyx-100">
                {a.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-linen/45" />
        </label>

        <IconButton
          label={tlPlaying ? "Pause" : "Play"}
          onClick={() => setTlPlaying(!tlPlaying)}
        >
          {tlPlaying ? (
            <Pause className="size-4 text-flame" strokeWidth={2} />
          ) : (
            <Play className="size-4 translate-x-px" strokeWidth={2} />
          )}
        </IconButton>

        <IconButton
          label="Capture"
          onClick={handleCapture}
          disabled={!canCapture || isRecording}
        >
          <Camera className="size-4" strokeWidth={1.8} />
        </IconButton>

        <button
          type="button"
          aria-label={isRecording ? "Stop recording" : "Record"}
          aria-pressed={isRecording}
          onClick={handleRecord}
          disabled={!canCapture}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35",
            isRecording
              ? "border-flame/60 bg-flame/15 text-flame"
              : "border-white/[0.06] bg-white/[0.02] text-linen/70 hover:bg-white/[0.06] hover:text-linen",
          )}
        >
          {isRecording ? (
            <>
              <Square className="size-3 fill-flame text-flame" />
              {formatClock(recordElapsedMs)}
            </>
          ) : (
            <Circle className="size-3.5 fill-flame text-flame" />
          )}
        </button>

        <Button
          variant="primary"
          icon={<Upload className="size-4" />}
          className="ml-1"
          onClick={() => {
            setExportPanelOpen(true);
            setRightTab("export");
          }}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
