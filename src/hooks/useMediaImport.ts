import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  detectMediaKind,
  loadImageFromFile,
  loadVideoFromFile,
} from "../lib/media";

/* ------------------------------------------------------------------ */
/*  Shared file → media-source import, used by the Source card and the  */
/*  preview welcome state so both accept the same files, enforce the    */
/*  same rules, and report the same errors.                            */
/* ------------------------------------------------------------------ */

export interface MediaImportApi {
  /** Load the first accepted file from a picker or a drop event. */
  handleFiles: (files: FileList | null) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useMediaImport(): MediaImportApi {
  const setImageMedia = useAppStore((s) => s.setImageMedia);
  const setVideoMedia = useAppStore((s) => s.setVideoMedia);
  const [error, setError] = useState<string | null>(null);

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

  return { handleFiles, error, clearError: () => setError(null) };
}
