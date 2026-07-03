/* ------------------------------------------------------------------ */
/*  Still-image encoding. Framing/scaling is handled by                */
/*  renderToExportCanvas; this module only encodes the finished canvas. */
/* ------------------------------------------------------------------ */

export type ExportImageFormat = "png" | "jpg" | "webp";

const MIME: Record<ExportImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

const EXT: Record<ExportImageFormat, string> = { png: "png", jpg: "jpg", webp: "webp" };

/** Encode a canvas to a Blob. Quality (0–100) applies to JPG/WebP only. */
export function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: ExportImageFormat,
  quality: number,
): Promise<Blob> {
  const q = format === "png" ? undefined : Math.min(1, Math.max(0, quality / 100));
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image export failed"))),
      MIME[format],
      q,
    );
  });
}

export function exportImageFilename(format: ExportImageFormat, stamp: string): string {
  return `efektly-capture-${stamp}.${EXT[format]}`;
}
