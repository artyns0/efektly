import type { EffectInstance } from "../../types/effects";
import type {
  ExportFraming,
  VideoContainer,
  VideoQuality,
  VideoResolutionId,
} from "../../types/app";
import { drawFramed, renderNativeFrame } from "./renderExportFrame";
import { resetAllHistory } from "../effects/frameHistory";
import { createFrameEncoder } from "./videoEncoder";

/* ------------------------------------------------------------------ */
/*  Media video export — renders the uploaded video frame-by-frame at   */
/*  the chosen output resolution with the active media effects applied,  */
/*  then encodes to real MP4/WebM. Independent of the preview size and   */
/*  never uses screen recording.                                        */
/* ------------------------------------------------------------------ */

const SHORT_EDGE: Record<Exclude<VideoResolutionId, "original">, number> = {
  "720p": 720,
  "1080p": 1080,
  "4k": 2160,
};

/** Exact output pixel size (even) for the chosen video resolution. */
export function videoTargetDims(
  res: VideoResolutionId,
  sw: number,
  sh: number,
): [number, number] {
  let w: number;
  let h: number;
  if (res === "original") {
    w = sw;
    h = sh;
  } else {
    const s = SHORT_EDGE[res];
    if (sw > sh) {
      h = s;
      w = Math.round((s * 16) / 9);
    } else if (sh > sw) {
      w = s;
      h = Math.round((s * 16) / 9);
    } else {
      w = s;
      h = s;
    }
  }
  return [Math.max(2, w - (w % 2)), Math.max(2, h - (h % 2))];
}

const BPP: Record<Exclude<VideoQuality, "custom">, number> = {
  recommended: 0.08,
  high: 0.14,
  veryHigh: 0.22,
};

export function computeBitrate(
  quality: VideoQuality,
  customMbps: number,
  w: number,
  h: number,
  fps: number,
): number {
  if (quality === "custom") {
    return Math.round(Math.min(200, Math.max(1, customMbps)) * 1_000_000);
  }
  const bitrate = w * h * fps * BPP[quality];
  return Math.round(Math.min(120_000_000, Math.max(1_000_000, bitrate)));
}

export interface ExportProgress {
  frame: number;
  total: number;
}

export interface MediaVideoExportOptions {
  resolution: VideoResolutionId;
  framing: ExportFraming;
  fps: number;
  container: VideoContainer;
  quality: VideoQuality;
  customBitrateMbps: number;
  onProgress?: (p: ExportProgress) => void;
  signal?: { cancelled: boolean };
}

export class ExportCancelledError extends Error {
  constructor() {
    super("Export cancelled");
    this.name = "ExportCancelledError";
  }
}

/** Seek a video to `t` and resolve once the frame is ready (with a safety timeout). */
function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("seeked", finish);
      resolve();
    };
    video.addEventListener("seeked", finish);
    try {
      video.currentTime = t;
    } catch {
      finish();
    }
    setTimeout(finish, 2000); // safety: never hang the loop
  });
}

export async function exportMediaVideo(
  video: HTMLVideoElement,
  effects: EffectInstance[],
  opts: MediaVideoExportOptions,
): Promise<Blob> {
  const sw = video.videoWidth || 1280;
  const sh = video.videoHeight || 720;
  const duration = video.duration || 0;
  const [tw, th] = videoTargetDims(opts.resolution, sw, sh);
  const total = Math.max(1, Math.round(duration * opts.fps));
  const bitrate = computeBitrate(opts.quality, opts.customBitrateMbps, tw, th, opts.fps);

  const encoder = await createFrameEncoder({
    container: opts.container,
    width: tw,
    height: th,
    fps: opts.fps,
    bitrate,
  });

  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const ctx = out.getContext("2d")!;

  const wasPaused = video.paused;
  const savedTime = video.currentTime;
  video.pause();

  // Temporal effects rebuild their frame history from the start of the export.
  resetAllHistory();

  try {
    for (let i = 0; i < total; i++) {
      if (opts.signal?.cancelled) {
        encoder.abort();
        throw new ExportCancelledError();
      }
      const t = Math.min(Math.max(0, duration - 1e-3), i / opts.fps);
      await seekTo(video, t);
      // Full source-resolution render with the active media effects, then
      // fit/crop into the exact export resolution.
      const native = renderNativeFrame(video, effects, (i / opts.fps) * 1000);
      drawFramed(ctx, native, native.width, native.height, tw, th, {
        mode: opts.framing,
      });
      await encoder.addFrame(out, i);
      opts.onProgress?.({ frame: i + 1, total });
    }
    return await encoder.finish();
  } finally {
    // Restore playback position.
    try {
      video.currentTime = savedTime;
      if (!wasPaused) void video.play();
    } catch {
      /* ignore */
    }
  }
}
