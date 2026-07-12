import { useEffect, useRef, useState } from "react";
import { Film, X } from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";
import type {
  ExportFraming,
  VideoQuality,
  VideoResolutionId,
} from "../../../types/app";
import { renderNativeFrame } from "../../../engine/export/renderExportFrame";
import {
  exportMediaVideo,
  videoTargetDims,
  ExportCancelledError,
} from "../../../engine/export/mediaVideoExport";
import { isVideoExportSupported } from "../../../engine/export/videoEncoder";
import { downloadBlob } from "../../../utils/download";
import { fileTimestamp, formatClock } from "../../../utils/time";
import { SelectControl } from "../../controls/SelectControl";
import { SliderControl } from "../../controls/SliderControl";
import { Button } from "../../controls/Button";
import { NameField } from "./NameField";
import { emitFlapReaction } from "../../../lib/flapEvents";

const RESOLUTIONS = [
  { value: "original", label: "Original (source)" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "4k", label: "4K" },
];
const QUALITIES = [
  { value: "recommended", label: "Recommended" },
  { value: "high", label: "High" },
  { value: "veryHigh", label: "Very High" },
  { value: "custom", label: "Custom bitrate" },
];
const FRAMING = [
  { value: "fit", label: "Fit (letterbox)" },
  { value: "crop", label: "Crop (fill)" },
];
const FPS_OPTS = [
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

export function VideoExportPanel() {
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  const projectName = useAppStore((s) => s.projectName);
  const res = useAppStore((s) => s.videoExportResolution);
  const setRes = useAppStore((s) => s.setVideoExportResolution);
  const container = useAppStore((s) => s.videoContainer);
  const quality = useAppStore((s) => s.videoQuality);
  const setQuality = useAppStore((s) => s.setVideoQuality);
  const customBitrate = useAppStore((s) => s.customBitrateMbps);
  const setCustomBitrate = useAppStore((s) => s.setCustomBitrateMbps);
  const framing = useAppStore((s) => s.videoFraming);
  const setFraming = useAppStore((s) => s.setVideoFraming);
  const fps = useAppStore((s) => s.fps);
  const setFps = useAppStore((s) => s.setFps);
  const fileName = useAppStore((s) => s.videoFileName);
  const setFileName = useAppStore((s) => s.setVideoFileName);

  const [cover, setCover] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ frame: number; total: number } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const supported = isVideoExportSupported();

  // Cover thumbnail from the current frame + active effects.
  useEffect(() => {
    if (!mediaVideo) {
      setCover(null);
      return;
    }
    try {
      const native = renderNativeFrame(mediaVideo, useAppStore.getState().effects);
      const c = document.createElement("canvas");
      const tw = 320;
      c.width = tw;
      c.height = Math.max(1, Math.round((tw * native.height) / native.width));
      c.getContext("2d")!.drawImage(native, 0, 0, c.width, c.height);
      setCover(c.toDataURL("image/jpeg", 0.7));
    } catch {
      setCover(null);
    }
  }, [mediaVideo]);

  if (!mediaVideo) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.1] bg-linen/[0.015] px-4 py-10 text-center">
        <Film className="size-6 text-linen/25" strokeWidth={1.5} />
        <p className="text-[13px] font-medium text-linen/70">No video loaded</p>
        <p className="text-xs text-linen/40">Upload a video to export MP4.</p>
      </div>
    );
  }

  const duration = isFinite(mediaVideo.duration) ? mediaVideo.duration : 0;
  const total = Math.max(1, Math.round(duration * fps));
  const [tw, th] = videoTargetDims(
    res,
    mediaVideo.videoWidth || 1280,
    mediaVideo.videoHeight || 720,
  );
  const baseName =
    fileName.trim() || projectName.trim() || `efektly-${fileTimestamp()}`;

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setProgress({ frame: 0, total });
    cancelRef.current = { cancelled: false };
    emitFlapReaction("working", Math.max(30_000, duration * 2_000));
    try {
      const blob = await exportMediaVideo(
        mediaVideo,
        useAppStore.getState().effects,
        {
          resolution: res,
          framing,
          fps,
          container,
          quality,
          customBitrateMbps: customBitrate,
          onProgress: (p) => setProgress(p),
          signal: cancelRef.current,
        },
      );
      downloadBlob(blob, `${baseName}.${container}`);
      setNote("Export complete.");
    } catch (e) {
      if (e instanceof ExportCancelledError) {
        setNote("Export cancelled.");
        emitFlapReaction("idle");
      } else {
        setNote(e instanceof Error ? e.message : "Export failed.");
        emitFlapReaction("confused");
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const pctDone = progress ? Math.round((progress.frame / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Cover */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/40">
        {cover ? (
          <img src={cover} alt="Video cover" className="block max-h-40 w-full object-contain" />
        ) : (
          <div className="grid h-28 place-items-center text-linen/30">
            <Film className="size-6" />
          </div>
        )}
      </div>

      <NameField value={fileName} onChange={setFileName} placeholder={baseName} />
      <SelectControl
        label="Resolution"
        value={res}
        options={RESOLUTIONS}
        onChange={(v) => setRes(v as VideoResolutionId)}
      />
      <SelectControl
        label="Quality"
        value={quality}
        options={QUALITIES}
        onChange={(v) => setQuality(v as VideoQuality)}
      />
      {quality === "custom" && (
        <SliderControl
          label="Bitrate"
          value={customBitrate}
          min={1}
          max={120}
          step={1}
          onChange={setCustomBitrate}
          format={(v) => `${v} Mbps`}
        />
      )}
      <SelectControl
        label="Frame Rate"
        value={String(fps)}
        options={FPS_OPTS}
        onChange={(v) => setFps(Number(v) as 24 | 30 | 60)}
      />
      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/30 px-3.5 py-2.5 text-sm">
        <span className="text-linen/70">Format</span>
        <span className="font-medium text-linen">MP4 (H.264)</span>
      </div>
      <SelectControl
        label="Framing"
        value={framing}
        options={FRAMING}
        onChange={(v) => setFraming(v as ExportFraming)}
      />

      {/* Duration + output summary */}
      <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-linen/[0.02] px-3 py-2 text-xs">
        <span className="text-linen/55">Duration</span>
        <span className="font-mono text-linen/60">
          {formatClock(duration * 1000)} · {tw}×{th} · {total} frames
        </span>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-flame transition-[width] duration-150"
              style={{ width: `${pctDone}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-linen/45">
            <span>Rendering… {pctDone}%</span>
            <span>{progress.frame}/{progress.total}</span>
          </div>
        </div>
      )}

      {busy ? (
        <Button
          icon={<X className="size-4" />}
          className="h-11 w-full justify-center border border-flame/50 text-flame"
          onClick={() => (cancelRef.current.cancelled = true)}
        >
          Cancel
        </Button>
      ) : (
        <Button
          variant="primary"
          icon={<Film className="size-4" />}
          className="h-11 w-full justify-center"
          disabled={!supported}
          onClick={handleExport}
        >
          Export {container.toUpperCase()}
        </Button>
      )}
      {!supported && (
        <p className="text-xs text-flame">
          Video export needs a Chromium-based browser (WebCodecs).
        </p>
      )}
      {note && (
        <p className={note.includes("complete") ? "text-xs text-linen/60" : "text-xs text-flame"}>
          {note}
        </p>
      )}
    </div>
  );
}
