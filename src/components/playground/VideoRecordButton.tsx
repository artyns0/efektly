import { Circle, Square } from "lucide-react";
import { Button } from "../controls/Button";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureRecord } from "../../hooks/useCaptureRecord";
import { formatClock } from "../../utils/time";

/* ------------------------------------------------------------------ */
/*  Record action for the Video Export card (playground). Same         */
/*  recording behavior as the top toolbar Record button; shares the     */
/*  module-level recorder so either can start/stop it.                 */
/* ------------------------------------------------------------------ */

export function VideoRecordButton() {
  const setExportPanelOpen = useAppStore((s) => s.setExportPanelOpen);
  const { canCapture, isRecording, recordElapsedMs, handleRecord } =
    useCaptureRecord({ onResult: () => setExportPanelOpen(true) });

  if (isRecording) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-flame">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-flame/60" />
            <span className="relative inline-flex size-2 rounded-full bg-flame" />
          </span>
          Recording…{" "}
          <span className="font-mono tabular-nums">{formatClock(recordElapsedMs)}</span>
        </div>
        <Button
          onClick={handleRecord}
          className="h-10 w-full justify-center border border-flame/60 bg-flame/15 text-flame"
          icon={<Square className="size-3.5 fill-flame text-flame" />}
        >
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-linen/40">
        No recorded clip yet — record the live preview as WebM (max 20s).
      </p>
      <Button
        variant="primary"
        onClick={handleRecord}
        disabled={!canCapture}
        className="h-10 w-full justify-center"
        icon={<Circle className="size-4 fill-onyx text-onyx" />}
      >
        Record WebM
      </Button>
    </div>
  );
}
