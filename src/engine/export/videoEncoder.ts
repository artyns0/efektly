import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from "mp4-muxer";
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from "webm-muxer";
import type { VideoContainer } from "../../types/app";

/* ------------------------------------------------------------------ */
/*  Frame-accurate video encoder (WebCodecs + muxer).                  */
/*  Encodes canvas frames to real H.264 MP4 (or VP9 WebM) — no screen   */
/*  capture, no MediaRecorder. Falls back gracefully when WebCodecs is  */
/*  unavailable (caller shows a message).                              */
/* ------------------------------------------------------------------ */

export function isVideoExportSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as unknown as { VideoEncoder?: unknown }).VideoEncoder ===
      "function" &&
    typeof (window as unknown as { VideoFrame?: unknown }).VideoFrame === "function"
  );
}

// Codec candidates, tried in order of quality; first supported wins.
const AVC_CANDIDATES = [
  "avc1.640034", // High 5.2 (4K)
  "avc1.640028", // High 4.0
  "avc1.4d0028", // Main 4.0
  "avc1.42e01e", // Baseline 3.0
];
const VP9_CANDIDATES = ["vp09.00.51.08", "vp09.00.10.08", "vp8"];

async function pickCodec(
  candidates: string[],
  config: { width: number; height: number; bitrate: number; framerate: number },
): Promise<string> {
  for (const codec of candidates) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({ codec, ...config });
      if (supported) return codec;
    } catch {
      /* try next */
    }
  }
  throw new Error("No supported video codec for these export settings.");
}

export interface FrameEncoder {
  /** Encode one canvas frame at its sequential index. */
  addFrame(canvas: HTMLCanvasElement, index: number): Promise<void>;
  /** Flush + finalize; returns the encoded file blob. */
  finish(): Promise<Blob>;
  /** Discard the encoder without producing a file (cancellation). */
  abort(): void;
}

export interface EncoderOptions {
  container: VideoContainer;
  width: number; // even
  height: number; // even
  fps: number;
  bitrate: number; // bits/sec
}

export async function createFrameEncoder(
  opts: EncoderOptions,
): Promise<FrameEncoder> {
  if (!isVideoExportSupported()) {
    throw new Error("Video export requires WebCodecs (use a recent Chromium browser).");
  }
  const width = opts.width - (opts.width % 2);
  const height = opts.height - (opts.height % 2);
  const isMp4 = opts.container === "mp4";

  const codec = await pickCodec(isMp4 ? AVC_CANDIDATES : VP9_CANDIDATES, {
    width,
    height,
    bitrate: opts.bitrate,
    framerate: opts.fps,
  });

  type AnyMuxer = {
    addVideoChunk: (c: EncodedVideoChunk, m?: EncodedVideoChunkMetadata) => void;
    finalize: () => void;
    target: { buffer: ArrayBuffer };
  };

  let muxer: AnyMuxer;
  if (isMp4) {
    muxer = new Mp4Muxer({
      target: new Mp4Target(),
      video: { codec: "avc", width, height },
      fastStart: "in-memory",
    }) as unknown as AnyMuxer;
  } else {
    muxer = new WebmMuxer({
      target: new WebmTarget(),
      video: { codec: "V_VP9", width, height },
    }) as unknown as AnyMuxer;
  }

  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      encoderError = e instanceof Error ? e : new Error(String(e));
    },
  });
  encoder.configure({
    codec,
    width,
    height,
    bitrate: opts.bitrate,
    framerate: opts.fps,
    latencyMode: "quality",
  });

  const frameDur = 1e6 / opts.fps; // microseconds
  const keyInterval = Math.max(1, Math.round(opts.fps * 2)); // keyframe every ~2s

  return {
    async addFrame(canvas, index) {
      if (encoderError) throw encoderError;
      // Backpressure: don't let the encode queue grow unbounded.
      while (encoder.encodeQueueSize > 8) {
        await new Promise((r) => setTimeout(r, 4));
      }
      const frame = new VideoFrame(canvas, {
        timestamp: Math.round(index * frameDur),
        duration: Math.round(frameDur),
      });
      encoder.encode(frame, { keyFrame: index % keyInterval === 0 });
      frame.close();
    },
    async finish() {
      await encoder.flush();
      if (encoderError) throw encoderError;
      muxer.finalize();
      encoder.close();
      const type = isMp4 ? "video/mp4" : "video/webm";
      return new Blob([muxer.target.buffer], { type });
    },
    abort() {
      try {
        if (encoder.state !== "closed") encoder.close();
      } catch {
        /* already closed */
      }
    },
  };
}
