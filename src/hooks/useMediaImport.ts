import { useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  detectMediaKind,
  loadImageFromFile,
  loadImageFromUrl,
  loadVideoFromFile,
} from "../lib/media";
import {
  originalWidthUrl,
  photoLabel,
  trackDownload,
  type UnsplashPhoto,
} from "./../lib/unsplash";

/* ------------------------------------------------------------------ */
/*  Shared file → media-source import, used by the Source card and the  */
/*  preview welcome state so both accept the same files, enforce the    */
/*  same rules, and report the same errors.                            */
/* ------------------------------------------------------------------ */

export interface MediaImportApi {
  /** Load the first accepted file from a picker or a drop event. */
  handleFiles: (files: FileList | null) => Promise<void>;
  /** Hotlink an Unsplash photo as the active media, pinging download once. */
  importUnsplashPhoto: (photo: UnsplashPhoto) => Promise<void>;
  /** True while a remote import is in flight. */
  importing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMediaImport(): MediaImportApi {
  const setImageMedia = useAppStore((s) => s.setImageMedia);
  const setVideoMedia = useAppStore((s) => s.setVideoMedia);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    const file = files?.[0];
    if (!file) return;
    const kind = detectMediaKind(file);
    if (!kind) {
      setError("Unsupported file. Use PNG, JPG, SVG, or MP4.");
      return;
    }
    try {
      if (kind === "image") {
        setImageMedia(await loadImageFromFile(file));
      } else {
        setVideoMedia(await loadVideoFromFile(file));
      }
    } catch (e) {
      // Surface the specific message (e.g. the 20-second limit) when present.
      const msg =
        e instanceof Error && /20 seconds/.test(e.message)
          ? e.message
          : `That ${kind} could not be opened.`;
      setError(msg);
    }
  };

  // Click and drop can both land on the same photo; only the first import of
  // a given id should ping Unsplash's download endpoint. Also guards against a
  // rerender re-firing the same import mid-flight.
  const tracked = useRef(new Set<string>());
  const inFlight = useRef<string | null>(null);

  /**
   * Import at full resolution. The photo is hotlinked, not copied into Efektly;
   * it still becomes real active media via the same store action an uploaded
   * file uses. `fullUrl` is the canonical source so Original export renders at
   * the true photo dimensions; a raw URL forced to the original width is the
   * fallback if `fullUrl` fails to decode.
   */
  const importUnsplashPhoto = async (photo: UnsplashPhoto) => {
    if (inFlight.current === photo.id) return; // ignore duplicate fire
    inFlight.current = photo.id;
    setError(null);
    setImporting(true);

    if (!tracked.current.has(photo.id)) {
      tracked.current.add(photo.id);
      void trackDownload(photo.id);
    }

    const attribution = {
      source: "unsplash" as const,
      unsplashPhotoId: photo.id,
      photographerName: photo.photographerName,
      photographerUsername: photo.photographerUsername,
      photographerUrl: photo.photographerUrl,
      unsplashPhotoUrl: photo.photoUrl,
      sourceUrl: photo.fullUrl,
      previewUrl: photo.regularUrl,
      originalWidth: photo.width,
      originalHeight: photo.height,
    };
    const meta = {
      name: photoLabel(photo),
      format: "JPG" as const,
      sizeLabel: `${photo.width} × ${photo.height}`,
      attribution,
    };

    try {
      setImageMedia(await loadImageFromUrl(photo.fullUrl, meta));
    } catch {
      // Full-res decode failed (memory/format) — try the original-width raw.
      try {
        setImageMedia(await loadImageFromUrl(originalWidthUrl(photo), meta));
      } catch {
        setError("That image could not be imported.");
      }
    } finally {
      setImporting(false);
      inFlight.current = null;
    }
  };

  return {
    handleFiles,
    importUnsplashPhoto,
    importing,
    error,
    clearError: () => setError(null),
  };
}
