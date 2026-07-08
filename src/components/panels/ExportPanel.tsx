import { useState, type ReactNode } from "react";
import { Download, ImageDown, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { FPS_OPTIONS, RESOLUTION_OPTIONS } from "../../data/mockData";
import type { ExportFraming, ResolutionId } from "../../types/app";
import {
  encodeCanvas,
  exportImageFilename,
  type ExportImageFormat,
} from "../../engine/export/exportImage";
import {
  renderNativeFrame,
  renderToExportCanvas,
} from "../../engine/export/renderExportFrame";
import { downloadBlob, downloadUrl } from "../../utils/download";
import { fileTimestamp, formatBytes, formatClock } from "../../utils/time";
import { Section } from "../controls/Section";
import { SliderControl } from "../controls/SliderControl";
import { SelectControl } from "../controls/SelectControl";
import { Button } from "../controls/Button";

const IMAGE_FORMATS: { value: ExportImageFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

const FRAMING_OPTIONS = [
  { value: "fit", label: "Fit" },
  { value: "crop", label: "Crop" },
];

const RESOLUTION_SELECT = RESOLUTION_OPTIONS.map((opt) => ({
  value: opt.id,
  label: `${opt.label} · ${opt.dimensions}`,
}));

export function ExportPanel({
  videoRecordAction,
}: {
  /** Optional action rendered in the Video Export card when no clip exists
   *  (the playground toolbar provides a Record/Stop button). */
  videoRecordAction?: ReactNode;
} = {}) {
  const format = useAppStore((s) => s.format);
  const setFormat = useAppStore((s) => s.setFormat);
  const resolution = useAppStore((s) => s.resolution);
  const setResolution = useAppStore((s) => s.setResolution);
  const videoResolution = useAppStore((s) => s.videoResolution);
  const setVideoResolution = useAppStore((s) => s.setVideoResolution);
  const imageFraming = useAppStore((s) => s.imageFraming);
  const setImageFraming = useAppStore((s) => s.setImageFraming);
  const videoFraming = useAppStore((s) => s.videoFraming);
  const setVideoFraming = useAppStore((s) => s.setVideoFraming);
  const fps = useAppStore((s) => s.fps);
  const setFps = useAppStore((s) => s.setFps);
  const quality = useAppStore((s) => s.quality);
  const setQuality = useAppStore((s) => s.setQuality);

  const capturedFrame = useAppStore((s) => s.capturedFrame);
  const capturedThumb = useAppStore((s) => s.capturedThumb);
  const capturedAt = useAppStore((s) => s.capturedAt);
  const clearCapture = useAppStore((s) => s.clearCapture);

  const recordedUrl = useAppStore((s) => s.recordedUrl);
  const recordedSize = useAppStore((s) => s.recordedSize);
  const recordedDurationMs = useAppStore((s) => s.recordedDurationMs);
  const clearRecording = useAppStore((s) => s.clearRecording);

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const imageFormat: ExportImageFormat =
    format === "jpg" || format === "webp" ? format : "png";
  const showQuality = imageFormat !== "png";

  const handleExportImage = async () => {
    setBusy(true);
    setNote(null);
    try {
      // Source = captured frame if present, else a fresh full-res render.
      let native = capturedFrame;
      if (!native) {
        const { mediaImage, mediaVideo, effects } = useAppStore.getState();
        const media = mediaImage ?? mediaVideo;
        if (media) native = renderNativeFrame(media, effects);
      }
      if (!native) {
        setNote("Nothing to export — upload media first.");
        return;
      }
      // Fit/crop the finished frame into the exact target resolution.
      const out = renderToExportCanvas(native, resolution, { mode: imageFraming });
      const blob = await encodeCanvas(out, imageFormat, quality);
      downloadBlob(blob, exportImageFilename(imageFormat, fileTimestamp()));
    } catch {
      setNote("Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadWebm = () => {
    if (recordedUrl) {
      downloadUrl(recordedUrl, `efektly-capture-${fileTimestamp()}.webm`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1 — Image Export */}
      <Section index={1} title="Image Export">
        {capturedFrame && capturedThumb ? (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-2.5">
            <img
              src={capturedThumb}
              alt="Captured frame"
              className="h-14 w-20 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-linen">Captured Frame</p>
              <p className="font-mono text-xs text-linen/45">
                {capturedAt ? new Date(capturedAt).toLocaleTimeString() : ""}
                {" · "}
                {capturedFrame.width} × {capturedFrame.height}
              </p>
            </div>
            <button
              type="button"
              onClick={clearCapture}
              aria-label="Clear capture"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-linen/[0.06] hover:text-linen"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : (
          <p className="mb-4 text-xs text-linen/40">
            No captured frame — export uses current Live Preview frame.
          </p>
        )}

        <div className="flex flex-col gap-3.5">
          <SelectControl
            label="Format"
            value={imageFormat}
            options={IMAGE_FORMATS}
            onChange={(v) => setFormat(v as ExportImageFormat)}
          />
          <SelectControl
            label="Resolution"
            value={resolution}
            options={RESOLUTION_SELECT}
            onChange={(v) => setResolution(v as ResolutionId)}
          />
          <SelectControl
            label="Framing"
            value={imageFraming}
            options={FRAMING_OPTIONS}
            onChange={(v) => setImageFraming(v as ExportFraming)}
          />

          {showQuality && (
            <SliderControl
              label="Quality"
              value={quality}
              min={10}
              max={100}
              step={5}
              onChange={setQuality}
              format={(v) => `${v}%`}
            />
          )}

          <Button
            variant="primary"
            icon={<ImageDown className="size-4" />}
            className="h-11 w-full justify-center"
            disabled={busy}
            onClick={handleExportImage}
          >
            {busy ? "Exporting…" : "Export Image"}
          </Button>
          {note && <p className="text-xs text-flame">{note}</p>}
        </div>
      </Section>

      {/* 2 — Video Export */}
      <Section index={2} title="Video Export">
        <div className="flex flex-col gap-4">
          {recordedUrl ? (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/30">
                <video
                  src={recordedUrl}
                  controls
                  playsInline
                  className="block max-h-48 w-full"
                />
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-linen/50">
                <span>Recorded Clip</span>
                <span>
                  {recordedDurationMs != null
                    ? formatClock(recordedDurationMs)
                    : "—"}
                  {recordedSize != null ? ` · ${formatBytes(recordedSize)}` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  icon={<Download className="size-4" />}
                  className="h-10 flex-1 justify-center"
                  onClick={handleDownloadWebm}
                >
                  Download WebM
                </Button>
                <Button
                  icon={<Trash2 className="size-4" />}
                  className="h-10"
                  onClick={clearRecording}
                >
                  Clear Recording
                </Button>
              </div>
            </div>
          ) : videoRecordAction ? (
            videoRecordAction
          ) : (
            <p className="text-xs text-linen/40">
              No recorded clip yet — use Record to create a WebM clip.
            </p>
          )}

          <SelectControl
            label="Resolution"
            value={videoResolution}
            options={RESOLUTION_SELECT}
            onChange={(v) => setVideoResolution(v as ResolutionId)}
          />
          <SelectControl
            label="Framing"
            value={videoFraming}
            options={FRAMING_OPTIONS}
            onChange={(v) => setVideoFraming(v as ExportFraming)}
          />
          <SelectControl
            label="FPS"
            value={String(fps)}
            options={FPS_OPTIONS.map((o) => ({ value: String(o), label: `${o} fps` }))}
            onChange={(v) => setFps(Number(v) as typeof fps)}
          />

          <p className="text-xs text-linen/35">
            Recording is WebM and capped at 20 seconds.
          </p>
        </div>
      </Section>
    </div>
  );
}
