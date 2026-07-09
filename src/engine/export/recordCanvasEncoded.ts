import { createFrameEncoder, isVideoExportSupported } from "./videoEncoder";
import { MAX_RECORD_MS, type RecorderHandle } from "./recordCanvas";

/* ------------------------------------------------------------------ */
/*  Record a live canvas (Shader / 3D) into a real MP4 via WebCodecs.  */
/*                                                                     */
/*  MediaRecorder is simpler but its output carries no usable duration  */
/*  (WebM writes none; its fragmented MP4 only describes the first      */
/*  fragment), so such a clip cannot be seeked, looped, or re-exported  */
/*  once imported into Media. Encoding frames ourselves through the      */
/*  same muxer the Video Export path uses produces a normal MP4.        */
/* ------------------------------------------------------------------ */

export function canRecordEncoded(): boolean {
  return isVideoExportSupported();
}

export interface EncodedRecorderOptions {
  fps: number;
  maxMs?: number;
  onTick: (elapsedMs: number) => void;
  onComplete: (blob: Blob, durationMs: number) => void;
  onError: (error: unknown) => void;
}

/** Conservative bitrate for screen-style content, capped at 40 Mbps. */
function bitrateFor(w: number, h: number, fps: number): number {
  return Math.min(40_000_000, Math.max(4_000_000, Math.round(w * h * fps * 0.12)));
}

export function recordCanvasEncoded(
  canvas: HTMLCanvasElement,
  o: EncodedRecorderOptions,
): RecorderHandle {
  const maxMs = o.maxMs ?? MAX_RECORD_MS;
  const frameMs = 1000 / o.fps;

  // The encoder needs a stable, even-sized source, while the live preview can
  // be resized mid-recording — so frames are staged through our own canvas.
  const width = Math.max(2, canvas.width - (canvas.width % 2));
  const height = Math.max(2, canvas.height - (canvas.height % 2));
  const stage = document.createElement("canvas");
  stage.width = width;
  stage.height = height;
  const stageCtx = stage.getContext("2d")!;

  let raf = 0;
  let stopped = false;
  let finishing = false;
  let index = 0;
  let nextFrameAt = 0;
  let startedAt = 0;
  let encoder: Awaited<ReturnType<typeof createFrameEncoder>> | null = null;
  let pending: Promise<void> = Promise.resolve();

  const handle: RecorderHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      if (finishing) return;
      finishing = true;
      const durationMs = index * frameMs;
      // Let the last queued addFrame settle before finalizing the file.
      pending
        .then(() => encoder!.finish())
        .then((blob) => o.onComplete(blob, durationMs))
        .catch((err) => {
          encoder?.abort();
          o.onError(err);
        });
    },
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (stopped || !encoder) return;

    const elapsed = now - startedAt;
    o.onTick(elapsed);
    if (elapsed >= maxMs) {
      handle.stop();
      return;
    }
    if (now < nextFrameAt) return;
    nextFrameAt += frameMs;
    // A long stall must not make us try to catch up with a burst of frames.
    if (now > nextFrameAt) nextFrameAt = now + frameMs;

    stageCtx.drawImage(canvas, 0, 0, width, height);
    const i = index++;
    pending = pending.then(() => encoder!.addFrame(stage, i)).catch((err) => {
      if (!stopped) {
        stopped = true;
        cancelAnimationFrame(raf);
        o.onError(err);
      }
    });
  };

  createFrameEncoder({
    container: "mp4",
    width,
    height,
    fps: o.fps,
    bitrate: bitrateFor(width, height, o.fps),
  })
    .then((enc) => {
      if (stopped) {
        enc.abort();
        return;
      }
      encoder = enc;
      startedAt = performance.now();
      nextFrameAt = startedAt;
      raf = requestAnimationFrame(loop);
    })
    .catch((err) => {
      stopped = true;
      o.onError(err);
    });

  return handle;
}
