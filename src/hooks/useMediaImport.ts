import { useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  detectMediaKind,
  loadImageFromFile,
  loadImageFromUrl,
  loadVideoFromFile,
} from "../lib/media";
import { photoLabel, trackDownload, type UnsplashPhoto } from "./../lib/unsplash";

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
  // a given id should ping Unsplash's download endpoint.
  const tracked = useRef(new Set<string>());

  /**
   * The photo is hotlinked, not copied into Efektly. It still becomes real
   * active media — the same store action an uploaded file uses.
   */
  const importUnsplashPhoto = async (photo: UnsplashPhoto) => {
    setError(null);
    setImporting(true);
    try {
      if (!tracked.current.has(photo.id)) {
        tracked.current.add(photo.id);
        void trackDownload(photo.id);
      }
      setImageMedia(
        await loadImageFromUrl(photo.regularUrl, {
          name: photoLabel(photo),
          format: "JPG",
          sizeLabel: "Unsplash",
          attribution: {
            source: "unsplash",
            unsplashPhotoId: photo.id,
            photographerName: photo.photographerName,
            photographerUsername: photo.photographerUsername,
            photographerUrl: photo.photographerUrl,
            unsplashPhotoUrl: photo.photoUrl,
            sourceUrl: photo.regularUrl,
          },
        }),
      );
    } catch {
      setError("That image could not be imported.");
    } finally {
      setImporting(false);
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
