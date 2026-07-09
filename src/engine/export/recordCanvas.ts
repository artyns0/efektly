/* ------------------------------------------------------------------ */
/*  Record the live canvas via captureStream + MediaRecorder.          */
/*  Auto-stops at maxMs. Local-first — nothing uploaded.               */
/* ------------------------------------------------------------------ */

export const MAX_RECORD_MS = 20_000;

/**
 * Prefer MP4. MediaRecorder's WebM carries no duration in its header, so such
 * a clip reports duration 0 — it cannot be seeked, looped, or re-exported once
 * imported into Media. WebM stays as the fallback for browsers without MP4.
 */
export function pickRecordMime(): string {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  if (typeof MediaRecorder !== "undefined") {
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
  }
  return "video/webm";
}

/** File extension matching a recorded blob's MIME type. */
export function recordingExtension(mime: string): "mp4" | "webm" {
  return mime.includes("mp4") ? "mp4" : "webm";
}

export function canRecord(): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function"
  );
}

export interface RecorderOptions {
  fps: number;
  maxMs?: number;
  onTick: (elapsedMs: number) => void;
  onComplete: (blob: Blob, durationMs: number) => void;
  onError: (error: unknown) => void;
}

export interface RecorderHandle {
  stop: () => void;
}

export function recordCanvas(
  canvas: HTMLCanvasElement,
  o: RecorderOptions,
): RecorderHandle {
  const maxMs = o.maxMs ?? MAX_RECORD_MS;
  const mime = pickRecordMime();
  const stream = canvas.captureStream(o.fps);
  const chunks: BlobPart[] = [];
  const startedAt = performance.now();

  let tickIv = 0;
  let autoStop = 0;
  let stopped = false;

  const cleanup = () => {
    clearInterval(tickIv);
    clearTimeout(autoStop);
    stream.getTracks().forEach((t) => t.stop());
  };

  let rec: MediaRecorder;
  try {
    rec = new MediaRecorder(stream, { mimeType: mime });
  } catch (err) {
    cleanup();
    o.onError(err);
    return { stop: () => {} };
  }

  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };
  rec.onstop = () => {
    cleanup();
    o.onComplete(new Blob(chunks, { type: mime }), performance.now() - startedAt);
  };
  rec.onerror = (e) => {
    cleanup();
    o.onError(e);
  };

  const handle: RecorderHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      if (rec.state !== "inactive") rec.stop();
      else cleanup();
    },
  };

  try {
    rec.start(100); // small timeslice so chunks flow while recording
  } catch (err) {
    cleanup();
    o.onError(err);
    return handle;
  }

  tickIv = window.setInterval(() => {
    const elapsed = performance.now() - startedAt;
    o.onTick(elapsed);
    if (elapsed >= maxMs) handle.stop();
  }, 200);
  autoStop = window.setTimeout(() => handle.stop(), maxMs);

  return handle;
}
