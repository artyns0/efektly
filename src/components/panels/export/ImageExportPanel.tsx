import { useState } from "react";
import { ImageDown } from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";
import { RESOLUTION_OPTIONS } from "../../../data/mockData";
import type { ExportFraming, ResolutionId } from "../../../types/app";
import {
  encodeCanvas,
  type ExportImageFormat,
} from "../../../engine/export/exportImage";
import {
  renderNativeFrame,
  renderToExportCanvas,
} from "../../../engine/export/renderExportFrame";
import { downloadBlob } from "../../../utils/download";
import { fileTimestamp } from "../../../utils/time";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Button } from "../../controls/Button";
import { NameField } from "./NameField";

const IMAGE_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
];
const FRAMING = [
  { value: "fit", label: "Fit" },
  { value: "crop", label: "Crop" },
];
const RESOLUTION_SELECT = RESOLUTION_OPTIONS.map((o) => ({
  value: o.id,
  label: `${o.label} · ${o.dimensions}`,
}));
const EXT: Record<ExportImageFormat, string> = { png: "png", jpg: "jpg" };

export function ImageExportPanel() {
  const format = useAppStore((s) => s.format);
  const setFormat = useAppStore((s) => s.setFormat);
  const resolution = useAppStore((s) => s.resolution);
  const setResolution = useAppStore((s) => s.setResolution);
  const imageFraming = useAppStore((s) => s.imageFraming);
  const setImageFraming = useAppStore((s) => s.setImageFraming);
  const quality = useAppStore((s) => s.quality);
  const setQuality = useAppStore((s) => s.setQuality);
  const projectName = useAppStore((s) => s.projectName);
  const imageFileName = useAppStore((s) => s.imageFileName);
  const setImageFileName = useAppStore((s) => s.setImageFileName);

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const imageFormat: ExportImageFormat = format === "jpg" ? "jpg" : "png";
  const showQuality = imageFormat !== "png";
  const baseName =
    imageFileName.trim() || projectName.trim() || `efektly-${fileTimestamp()}`;

  const handleExport = async () => {
    setBusy(true);
    setNote(null);
    try {
      // Always render fresh from the live source + current effect stack. The
      // export is the single source of truth — never a stale captured frame,
      // which would drop effects added after capture and cap the resolution.
      const { mediaImage, mediaVideo, effects } = useAppStore.getState();
      const media = mediaImage ?? mediaVideo;
      if (!media) {
        setNote("Nothing to export — upload media first.");
        return;
      }
      const native = renderNativeFrame(media, effects);
      const outCanvas = renderToExportCanvas(native, resolution, { mode: imageFraming });
      const blob = await encodeCanvas(outCanvas, imageFormat, quality);
      downloadBlob(blob, `${baseName}.${EXT[imageFormat]}`);
    } catch (e) {
      // Never silently fall back to an unprocessed image — surface the failure.
      console.error("[export] image export failed:", e);
      setNote(
        e instanceof Error && /tainted|cross-origin|SecurityError/i.test(e.message)
          ? "Export blocked by image security (CORS). Re-import the image."
          : "Export failed — the effect pipeline could not render this frame.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <NameField
        value={imageFileName}
        onChange={setImageFileName}
        placeholder={baseName}
      />
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
        options={FRAMING}
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
        onClick={handleExport}
      >
        {busy ? "Exporting…" : "Export Image"}
      </Button>
      {note && <p className="text-xs text-flame">{note}</p>}
    </div>
  );
}
