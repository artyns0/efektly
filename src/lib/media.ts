import type { MediaType, SourceMedia } from "../types/app";

/* ------------------------------------------------------------------ */
/*  Local-first media helpers (images + videos).                       */
/*  Files are read with the browser File API and held as object URLs — */
/*  nothing is ever uploaded to a server.                              */
/* ------------------------------------------------------------------ */

/** MIME types we accept for upload (PNG, JPEG, SVG images; MP4 video). */
export const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/svg+xml"];
export const ACCEPTED_VIDEO_MIME = ["video/mp4"];

/** Extensions accepted as a fallback when a File reports no/odd MIME type. */
export const ACCEPTED_EXT = [".png", ".jpg", ".jpeg", ".svg"];
export const ACCEPTED_VIDEO_EXT = [".mp4"];

/** Value for an <input type="file"> accept attribute. */
export const ACCEPT_ATTR =
  "image/png,image/jpeg,image/svg+xml,video/mp4,.png,.jpg,.jpeg,.svg,.mp4";

export function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_MIME.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXT.some((ext) => name.endsWith(ext));
}

export function isAcceptedVideo(file: File): boolean {
  if (ACCEPTED_VIDEO_MIME.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_VIDEO_EXT.some((ext) => name.endsWith(ext));
}

/** Classify a dropped/selected file, or null if unsupported. */
export function detectMediaKind(file: File): MediaType | null {
  if (isAcceptedImage(file)) return "image";
  if (isAcceptedVideo(file)) return "video";
  return null;
}

/** Human-readable byte size, e.g. "4.2 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

function detectFormat(file: File): SourceMedia["format"] {
  if (file.type === "image/png") return "PNG";
  if (file.type === "image/svg+xml") return "SVG";
  if (file.type === "image/jpeg") return "JPG";
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "PNG";
  if (name.endsWith(".svg")) return "SVG";
  return "JPG"; // .jpg / .jpeg
}

function detectVideoFormat(_file: File): SourceMedia["format"] {
  return "MP4";
}

/** Seconds -> "m:ss" (or "h:mm:ss"). */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export interface LoadedImage {
  image: HTMLImageElement;
  url: string;
  meta: SourceMedia;
}

export interface LoadedVideo {
  video: HTMLVideoElement;
  url: string;
  meta: SourceMedia;
}

/** Max allowed input video length. */
export const MAX_VIDEO_SECONDS = 20;

/**
 * Decode a File into an HTMLImageElement + object URL, and read its metadata.
 * The caller owns the returned `url` and is responsible for revoking it
 * (the store does this when media is replaced or cleared).
 */
export function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({
        image,
        url,
        meta: {
          name: file.name,
          width: image.naturalWidth,
          height: image.naturalHeight,
          format: detectFormat(file),
          sizeLabel: formatFileSize(file.size),
        },
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    image.src = url;
  });
}

/**
 * Load a File into an HTMLVideoElement + object URL and read its metadata.
 * Resolves once the first frame is available (so it can be drawn immediately).
 * The video is muted + inline so it can be played back without user gesture.
 */
export function loadVideoFromFile(file: File): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    video.onloadeddata = () => {
      // Enforce the 20-second input limit (skip when duration is unknown,
      // e.g. some MediaRecorder-produced WebM report Infinity).
      if (isFinite(video.duration) && video.duration > MAX_VIDEO_SECONDS) {
        URL.revokeObjectURL(url);
        reject(new Error("Video must be 20 seconds or shorter."));
        return;
      }
      resolve({
        video,
        url,
        meta: {
          name: file.name,
          width: video.videoWidth,
          height: video.videoHeight,
          format: detectVideoFormat(file),
          sizeLabel: formatFileSize(file.size),
          durationLabel: isFinite(video.duration)
            ? formatDuration(video.duration)
            : undefined,
        },
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode video"));
    };
  });
}
