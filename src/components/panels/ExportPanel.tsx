import { useState } from "react";
import { Download, ImageDown, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
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
import { Button } from "../controls/Button";

const IMAGE_FORMATS: { value: ExportImageFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-xl border text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
        active
          ? "border-flame/55 bg-flame/12 text-flame shadow-[0_8px_22px_-14px_rgba(255,90,31,0.85)]"
          : "border-white/[0.06] bg-linen/[0.025] text-linen/60 hover:border-white/[0.12] hover:bg-linen/[0.05] hover:text-linen",
      )}
    >
      {children}
    </button>
  );
}

/** Fit / Crop framing picker. */
function FramingPicker({
  value,
  onChange,
}: {
  value: ExportFraming;
  onChange: (f: ExportFraming) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-linen/70">Framing</p>
      <div className="grid grid-cols-2 gap-2">
        <Choice active={value === "fit"} onClick={() => onChange("fit")}>
          Fit
        </Choice>
        <Choice active={value === "crop"} onClick={() => onChange("crop")}>
          Crop
        </Choice>
      </div>
    </div>
  );
}

/** Two-column resolution picker, shared by both export cards. */
function ResolutionGrid({
  value,
  onChange,
}: {
  value: ResolutionId;
  onChange: (id: ResolutionId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {RESOLUTION_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              active
                ? "border-flame/55 bg-flame/12 shadow-[0_8px_22px_-14px_rgba(255,90,31,0.85)]"
                : "border-white/[0.06] bg-linen/[0.025] hover:border-white/[0.12] hover:bg-linen/[0.05]",
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-flame" : "text-linen/80",
              )}
            >
              {opt.label}
            </span>
            <span className="font-mono text-[11px] text-linen/45">
              {opt.dimensions}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ExportPanel() {
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

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm text-linen/70">Format</p>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_FORMATS.map((opt) => (
                <Choice
                  key={opt.value}
                  active={imageFormat === opt.value}
                  onClick={() => setFormat(opt.value)}
                >
                  {opt.label}
                </Choice>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-linen/70">Resolution</p>
            <ResolutionGrid value={resolution} onChange={setResolution} />
          </div>

          <FramingPicker value={imageFraming} onChange={setImageFraming} />

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
          ) : (
            <p className="text-xs text-linen/40">
              No recorded clip yet — use Record to create a WebM clip.
            </p>
          )}

          <div>
            <p className="mb-2 text-sm text-linen/70">Resolution</p>
            <ResolutionGrid
              value={videoResolution}
              onChange={setVideoResolution}
            />
          </div>

          <FramingPicker value={videoFraming} onChange={setVideoFraming} />

          <div>
            <p className="mb-2 text-sm text-linen/70">Recording FPS</p>
            <div className="grid grid-cols-3 gap-2">
              {FPS_OPTIONS.map((opt) => (
                <Choice key={opt} active={fps === opt} onClick={() => setFps(opt)}>
                  {opt} fps
                </Choice>
              ))}
            </div>
          </div>

          <p className="text-xs text-linen/35">
            Recording is WebM and capped at 20 seconds.
          </p>
        </div>
      </Section>
    </div>
  );
}
