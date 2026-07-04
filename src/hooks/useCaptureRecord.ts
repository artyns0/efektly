import { useRef } from "react";
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

export function useCaptureRecord(options?: CaptureRecordOptions): CaptureRecordApi {
  const setMode = useAppStore((s) => s.setMode);
  const setCapture = useAppStore((s) => s.setCapture);
  const isRecording = useAppStore((s) => s.isRecording);
  const recordElapsedMs = useAppStore((s) => s.recordElapsedMs);
  const mode = useAppStore((s) => s.mode);
  const mediaImage = useAppStore((s) => s.mediaImage);
  const mediaVideo = useAppStore((s) => s.mediaVideo);

  const recorderRef = useRef<RecorderHandle | null>(null);
  const recordRafRef = useRef(0);

  const isShader = mode === "shader";
  const canCapture = mediaImage !== null || mediaVideo !== null || isShader;

  const reveal = options?.onResult ?? (() => setMode("export"));

  const handleCapture = () => {
    const { mediaImage: img, mediaVideo: vid, effects, mode: m } =
      useAppStore.getState();
    const media = img ?? vid;
    let frame: HTMLCanvasElement | null = null;
    if (media) {
      frame = renderNativeFrame(media, effects);
    } else if (m === "shader") {
      const canvas = getPreviewCanvas();
      if (canvas) frame = snapshotCanvas(canvas);
    }
    if (!frame) return;
    setCapture(frame, makeThumb(frame));
    reveal();
  };

  const handleRecord = () => {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }
    const state = useAppStore.getState();
    const media = state.mediaImage ?? state.mediaVideo;
    if (!canRecord()) return;

    // Shader mode: record the live procedural canvas directly.
    if (!media) {
      const canvas = getPreviewCanvas();
      if (!canvas) return;
      state.setRecording(true);
      recorderRef.current = recordCanvas(canvas, {
        fps: state.fps,
        onTick: (ms) => useAppStore.getState().setRecordElapsed(ms),
        onComplete: (blob, durationMs) => {
          recorderRef.current = null;
          const s = useAppStore.getState();
          s.setRecording(false);
          s.setRecordedClip({ blob, durationMs });
          reveal();
        },
        onError: () => {
          recorderRef.current = null;
          useAppStore.getState().setRecording(false);
        },
      });
      return;
    }

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
      recordRafRef.current = requestAnimationFrame(drawLoop);
    };
    drawLoop(performance.now());
    const stopLoop = () => cancelAnimationFrame(recordRafRef.current);

    state.setRecording(true);
    recorderRef.current = recordCanvas(recCanvas, {
      fps: state.fps,
      onTick: (ms) => useAppStore.getState().setRecordElapsed(ms),
      onComplete: (blob, durationMs) => {
        stopLoop();
        recorderRef.current = null;
        const s = useAppStore.getState();
        s.setRecording(false);
        s.setRecordedClip({ blob, durationMs });
        reveal();
      },
      onError: () => {
        stopLoop();
        recorderRef.current = null;
        useAppStore.getState().setRecording(false);
      },
    });
  };

  return { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord };
}
