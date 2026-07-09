import { useState, type ReactNode } from "react";
import { Download, FileVideo, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { recordingExtension } from "../../engine/export/recordCanvas";
import { loadVideoFromBlob } from "../../lib/media";
import { downloadUrl } from "../../utils/download";
import { fileTimestamp, formatBytes, formatClock } from "../../utils/time";
import { Section } from "../controls/Section";
import { Button } from "../controls/Button";
import { ImageExportPanel } from "./export/ImageExportPanel";
import { VideoExportPanel } from "./export/VideoExportPanel";

/* ------------------------------------------------------------------ */
/*  Export tab — Image Export (still), Video Export (frame-accurate     */
/*  MP4/WebM for media videos), and Canvas Record (WebM capture, shown   */
/*  in Shader + 3D modes). Record is not the media video export path.   */
/* ------------------------------------------------------------------ */

/** Shader/3D recording: live WebM capture + the resulting clip. */
function CanvasRecordSection({ recordAction }: { recordAction?: ReactNode }) {
  const recordedUrl = useAppStore((s) => s.recordedUrl);
  const recordedSize = useAppStore((s) => s.recordedSize);
  const recordedDurationMs = useAppStore((s) => s.recordedDurationMs);
  const clearRecording = useAppStore((s) => s.clearRecording);
  const recordedFrom = useAppStore((s) => s.recordedFrom);
  const recordedBlob = useAppStore((s) => s.recordedBlob);
  const mode = useAppStore((s) => s.mode);

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = mode === "three" ? "3D viewport" : "shader preview";

  if (!recordedUrl) {
    return (
      recordAction ?? (
        <p className="text-xs text-linen/40">Use Record to capture the {label}.</p>
      )
    );
  }

  const ext = recordingExtension(recordedBlob?.type ?? "");
  const fileName = `efektly-${recordedFrom ?? "shader"}-${fileTimestamp()}.${ext}`;

  // Hand the recorded blob to the Media workflow as if it had been uploaded,
  // then switch to the Source panel so it shows up as the active media.
  const handleImport = async () => {
    const { setVideoMedia, setMode, setRailSection } = useAppStore.getState();
    if (!recordedBlob || importing) return;
    setImporting(true);
    setError(null);
    try {
      setVideoMedia(await loadVideoFromBlob(recordedBlob, fileName));
      setMode("media");
      setRailSection("source");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/30">
        <video src={recordedUrl} controls playsInline className="block max-h-48 w-full" />
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-linen/50">
        <span>Recorded Clip</span>
        <span>
          {recordedDurationMs != null ? formatClock(recordedDurationMs) : "—"}
          {recordedSize != null ? ` · ${formatBytes(recordedSize)}` : ""}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          icon={<Download className="size-4" />}
          className="h-10 flex-1 justify-center"
          onClick={() => downloadUrl(recordedUrl, fileName)}
        >
          Download
        </Button>
        <Button
          icon={<FileVideo className="size-4" />}
          className="h-10 flex-1 justify-center"
          disabled={importing}
          onClick={handleImport}
        >
          {importing ? "Importing…" : "Import to Media"}
        </Button>
        <Button icon={<Trash2 className="size-4" />} className="h-10" onClick={clearRecording}>
          Clear
        </Button>
      </div>
      {error && <p className="text-xs text-flame">{error}</p>}
    </div>
  );
}

export function ExportPanel({
  videoRecordAction,
}: {
  /** Shader/3D Record/Stop action (provided by the playground). */
  videoRecordAction?: ReactNode;
} = {}) {
  const mode = useAppStore((s) => s.mode);
  const isCanvasMode = mode === "shader" || mode === "three";

  return (
    <div className="flex flex-col gap-4">
      <Section index={1} title="Image Export">
        <ImageExportPanel />
      </Section>

      {isCanvasMode ? (
        <Section index={2} title={mode === "three" ? "3D Record" : "Shader Record"}>
          <CanvasRecordSection recordAction={videoRecordAction} />
        </Section>
      ) : (
        <Section index={2} title="Video Export">
          <VideoExportPanel />
        </Section>
      )}
    </div>
  );
}
