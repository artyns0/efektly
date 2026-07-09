import { useAppStore } from "../store/useAppStore";
import {
  drawFramed,
  renderFrame,
  renderNativeFrame,
} from "../engine/export/renderExportFrame";
import { intrinsicSize } from "../engine/pipeline";
import { getPreviewCanvas } from "../engine/preview/canvasRegistry";
import { targetDims } from "../utils/canvasFit";
import {
  canRecord,
  recordCanvas,
  type RecorderHandle,
} from "../engine/export/recordCanvas";
import {
  canRecordEncoded,
  recordCanvasEncoded,
} from "../engine/export/recordCanvasEncoded";

/* ------------------------------------------------------------------ */
/*  Capture + Record actions, shared by the classic TopBar and the     */
/*  playground toolbar so the behavior stays identical in both shells.  */
/* ------------------------------------------------------------------ */

/** Small JPEG thumbnail data URL from a rendered frame. */
function makeThumb(source: HTMLCanvasElement): string {
  const tw = 160;
  const th = Math.max(1, Math.round((tw * source.height) / source.width));
  const c = document.createElement("canvas");
  c.width = tw;
  c.height = th;
  c.getContext("2d")!.drawImage(source, 0, 0, tw, th);
  return c.toDataURL("image/jpeg", 0.7);
}

/** Detached copy of a canvas (e.g. the shader output). */
function snapshotCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext("2d")!.drawImage(source, 0, 0);
  return copy;
}

export interface CaptureRecordApi {
  canCapture: boolean;
  isRecording: boolean;
  recordElapsedMs: number;
  handleCapture: () => void;
  handleRecord: () => void;
}

export interface CaptureRecordOptions {
  /**
   * Called after a capture is stored or a recording completes, to surface the
   * export result. Defaults to switching to Export mode (classic shell); the
   * playground passes its own (open the always-visible export panel) so the
   * source mode (media/shader) is never disturbed.
   */
  onResult?: () => void;
}

// Module-level so the recorder can be started from one component (top toolbar)
// and stopped from another (Video Export card). Only one recording at a time.
let activeRecorder: RecorderHandle | null = null;
let activeRaf = 0;

export function useCaptureRecord(options?: CaptureRecordOptions): CaptureRecordApi {
  const setMode = useAppStore((s) => s.setMode);
  const setCapture = useAppStore((s) => s.setCapture);
  const isRecording = useAppStore((s) => s.isRecording);
  const recordElapsedMs = useAppStore((s) => s.recordElapsedMs);
  const mode = useAppStore((s) => s.mode);
  const mediaImage = useAppStore((s) => s.mediaImage);
  const mediaVideo = useAppStore((s) => s.mediaVideo);

  // Shader + 3D render straight to a live canvas, so they can always be
  // captured/recorded regardless of whether media happens to be loaded.
  const isCanvasMode = mode === "shader" || mode === "three";
  const canCapture = mediaImage !== null || mediaVideo !== null || isCanvasMode;

  const reveal = options?.onResult ?? (() => setMode("export"));

  const handleCapture = () => {
    const { mediaImage: img, mediaVideo: vid, effects, mode: m } =
      useAppStore.getState();
    const media = img ?? vid;
    let frame: HTMLCanvasElement | null = null;
    if (m === "shader" || m === "three") {
      const canvas = getPreviewCanvas();
      if (canvas) frame = snapshotCanvas(canvas);
    } else if (media) {
      frame = renderNativeFrame(media, effects);
    }
    if (!frame) return;
    setCapture(frame, makeThumb(frame));
    reveal();
  };

  const handleRecord = () => {
    if (isRecording) {
      activeRecorder?.stop();
      return;
    }
    const state = useAppStore.getState();

    // Shader + 3D: record the live preview canvas (2D or WebGL) directly.
    // WebCodecs gives a seekable MP4; MediaRecorder is the fallback.
    if (state.mode === "shader" || state.mode === "three") {
      const canvas = getPreviewCanvas();
      if (!canvas) return;
      if (!canRecordEncoded() && !canRecord()) return;
      const from = state.mode === "three" ? "three" : "shader";
      const start = canRecordEncoded() ? recordCanvasEncoded : recordCanvas;
      state.setRecording(true);
      activeRecorder = start(canvas, {
        fps: state.fps,
        onTick: (ms) => useAppStore.getState().setRecordElapsed(ms),
        onComplete: (blob, durationMs) => {
          activeRecorder = null;
          const s = useAppStore.getState();
          s.setRecording(false);
          s.setRecordedClip({ blob, durationMs, from });
          reveal();
        },
        onError: () => {
          activeRecorder = null;
          useAppStore.getState().setRecording(false);
        },
      });
      return;
    }

    if (!canRecord()) return;

    const media = state.mediaImage ?? state.mediaVideo;
    if (!media) return;

    // Dedicated recording canvas at the selected video export resolution.
    const { w: sw, h: sh } = intrinsicSize(media);
    const [tw, th] = targetDims(state.videoResolution, sw, sh);
    const recCanvas = document.createElement("canvas");
    recCanvas.width = tw;
    recCanvas.height = th;
    const recCtx = recCanvas.getContext("2d")!;

    const nativeCanvas = document.createElement("canvas");
    nativeCanvas.width = Math.max(1, sw);
    nativeCanvas.height = Math.max(1, sh);
    const nativeCtx = nativeCanvas.getContext("2d")!;

    const drawLoop = (time: number) => {
      const s = useAppStore.getState();
      const media2 = s.mediaImage ?? s.mediaVideo;
      if (media2) {
        renderFrame(nativeCtx, media2, s.effects, sw, sh, time);
        drawFramed(recCtx, nativeCanvas, sw, sh, tw, th, { mode: s.videoFraming });
      }
      activeRaf = requestAnimationFrame(drawLoop);
    };
    drawLoop(performance.now());
    const stopLoop = () => cancelAnimationFrame(activeRaf);

    state.setRecording(true);
    activeRecorder = recordCanvas(recCanvas, {
      fps: state.fps,
      onTick: (ms) => useAppStore.getState().setRecordElapsed(ms),
      onComplete: (blob, durationMs) => {
        stopLoop();
        activeRecorder = null;
        const s = useAppStore.getState();
        s.setRecording(false);
        s.setRecordedClip({ blob, durationMs, from: "shader" });
        reveal();
      },
      onError: () => {
        stopLoop();
        activeRecorder = null;
        useAppStore.getState().setRecording(false);
      },
    });
  };

  return { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord };
}
