import { type ReactNode } from "react";
import { Download, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { downloadUrl } from "../../utils/download";
import { fileTimestamp, formatBytes, formatClock } from "../../utils/time";
import { Section } from "../controls/Section";
import { Button } from "../controls/Button";
import { ImageExportPanel } from "./export/ImageExportPanel";
import { VideoExportPanel } from "./export/VideoExportPanel";

/* ------------------------------------------------------------------ */
/*  Export tab — Image Export (still), Video Export (frame-accurate     */
/*  MP4/WebM for media videos), and Shader Record (WebM capture, shown   */
/*  only in Shader mode). Record is not the media video export path.    */
/* ------------------------------------------------------------------ */

/** Shader-mode recording: live WebM capture + the resulting clip. */
function ShaderRecordSection({ recordAction }: { recordAction?: ReactNode }) {
  const recordedUrl = useAppStore((s) => s.recordedUrl);
  const recordedSize = useAppStore((s) => s.recordedSize);
  const recordedDurationMs = useAppStore((s) => s.recordedDurationMs);
  const clearRecording = useAppStore((s) => s.clearRecording);

  if (!recordedUrl) {
    return (
      recordAction ?? (
        <p className="text-xs text-linen/40">
          Use Record to capture the shader as a WebM clip.
        </p>
      )
    );
  }

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
          onClick={() =>
            downloadUrl(recordedUrl, `efektly-shader-${fileTimestamp()}.webm`)
          }
        >
          Download WebM
        </Button>
        <Button icon={<Trash2 className="size-4" />} className="h-10" onClick={clearRecording}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export function ExportPanel({
  videoRecordAction,
}: {
  /** Shader-mode Record/Stop action (provided by the playground). */
  videoRecordAction?: ReactNode;
} = {}) {
  const mode = useAppStore((s) => s.mode);
  const isShader = mode === "shader";

  return (
    <div className="flex flex-col gap-4">
      <Section index={1} title="Image Export">
        <ImageExportPanel />
      </Section>

      {isShader ? (
        <Section index={2} title="Shader Record">
          <ShaderRecordSection recordAction={videoRecordAction} />
        </Section>
      ) : (
        <Section index={2} title="Video Export">
          <VideoExportPanel />
        </Section>
      )}
    </div>
  );
}
