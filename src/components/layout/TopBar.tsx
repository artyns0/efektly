import { Camera, Circle, Redo2, Square, Undo2, Upload } from "lucide-react";
import { Button } from "../controls/Button";
import { Logo } from "./Logo";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureRecord } from "../../hooks/useCaptureRecord";
import { formatClock } from "../../utils/time";

export function TopBar() {
  const setMode = useAppStore((s) => s.setMode);
  const { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord } =
    useCaptureRecord();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
      {/* Brand */}
      <div className="flex items-center gap-3.5">
        <Logo />
        <div className="flex items-baseline gap-3.5">
          <span className="text-[22px] font-semibold leading-none tracking-tight text-linen">
            Efektly
          </span>
          <span className="hidden text-[13px] leading-none text-linen/40 sm:inline">
            Upload. Stylize. Export.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="subtle" icon={<Undo2 className="size-4" />}>
            Undo
          </Button>
          <Button variant="subtle" icon={<Redo2 className="size-4" />}>
            Redo
          </Button>
        </div>

        <div className="mx-1.5 hidden h-6 w-px bg-white/[0.08] md:block" />

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
