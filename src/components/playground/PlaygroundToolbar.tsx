import {
  Camera,
  ChevronDown,
  Circle,
  Redo2,
  Settings,
  Square,
  Undo2,
  Upload,
} from "lucide-react";
import { Button } from "../controls/Button";
import { Logo } from "../layout/Logo";
import { InputModeToggle } from "../panels/InputModeToggle";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureRecord } from "../../hooks/useCaptureRecord";
import { formatClock } from "../../utils/time";
import type { Orientation } from "../../types/app";

const ASPECTS: { value: Orientation; label: string }[] = [
  { value: "horizontal", label: "16:9" },
  { value: "vertical", label: "9:16" },
  { value: "square", label: "1:1" },
];

export function PlaygroundToolbar() {
  const setMode = useAppStore((s) => s.setMode);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const orientation = useAppStore((s) => s.orientation);
  const setOrientation = useAppStore((s) => s.setOrientation);
  const { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord } =
    useCaptureRecord();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] px-5">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Logo />
        <div className="flex items-baseline gap-3">
          <span className="text-[19px] font-semibold leading-none tracking-tight text-linen">
            Efektly
          </span>
          <span className="hidden text-[13px] leading-none text-linen/40 lg:inline">
            Upload. Stylize. Animate. Export.
          </span>
        </div>
      </div>

      {/* Centered Media / Shader switch */}
      <div className="flex flex-1 justify-center">
        <div className="w-60">
          <InputModeToggle />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1 xl:flex">
          <Button variant="subtle" icon={<Undo2 className="size-4" />} aria-label="Undo" />
          <Button variant="subtle" icon={<Redo2 className="size-4" />} aria-label="Redo" />
        </div>

        {/* Aspect ratio */}
        <label className="relative hidden lg:block">
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as Orientation)}
            aria-label="Aspect ratio"
            className="h-9 appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] pl-3 pr-8 text-sm text-linen/80 transition-colors hover:bg-white/[0.05] focus:border-flame/50 focus:outline-none"
          >
            {ASPECTS.map((a) => (
              <option key={a.value} value={a.value} className="bg-onyx-100">
                {a.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-linen/45" />
        </label>

        <button
          aria-label="Settings"
          onClick={() => setRailSection("settings")}
          className="grid size-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-linen/70 transition-colors hover:bg-white/[0.05] hover:text-linen"
        >
          <Settings className="size-4" strokeWidth={1.8} />
        </button>

        <div className="mx-0.5 h-6 w-px bg-white/[0.08]" />

        <Button
          icon={<Camera className="size-4" />}
          onClick={handleCapture}
          disabled={!canCapture || isRecording}
        >
          Capture
        </Button>

        <Button
          onClick={handleRecord}
          disabled={!canCapture}
          aria-pressed={isRecording}
          className={
            isRecording ? "border border-flame/60 bg-flame/15 text-flame" : undefined
          }
          icon={
            isRecording ? (
              <Square className="size-3.5 fill-flame text-flame" />
            ) : (
              <Circle className="size-4 fill-flame text-flame" />
            )
          }
        >
          {isRecording ? formatClock(recordElapsedMs) : "Record"}
        </Button>

        <Button
          variant="primary"
          icon={<Upload className="size-4" />}
          onClick={() => setMode("export")}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
