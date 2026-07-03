import { useRef } from "react";
import { Camera, Circle, Redo2, Square, Undo2, Upload } from "lucide-react";
import { Button } from "../controls/Button";
import { Logo } from "./Logo";
import { useAppStore } from "../../store/useAppStore";
import {
  drawFramed,
  renderFrame,
  renderNativeFrame,
} from "../../engine/export/renderExportFrame";
import { intrinsicSize } from "../../engine/pipeline";
import { getPreviewCanvas } from "../../engine/preview/canvasRegistry";
import { targetDims } from "../../utils/canvasFit";
import {
  canRecord,
  recordCanvas,
  type RecorderHandle,
} from "../../engine/export/recordCanvas";
import { formatClock } from "../../utils/time";

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

export function TopBar() {
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
  // Capturable when there's media, or in Shader mode (procedural canvas).
  const canCapture = mediaImage !== null || mediaVideo !== null || isShader;

  const handleCapture = () => {
    const { mediaImage: img, mediaVideo: vid, effects, mode: m } = useAppStore.getState();
    const media = img ?? vid;
    let frame: HTMLCanvasElement | null = null;
    if (media) {
      // Current rendered frame at source resolution.
      frame = renderNativeFrame(media, effects);
    } else if (m === "shader") {
      const canvas = getPreviewCanvas();
      if (canvas) frame = snapshotCanvas(canvas);
    }
    if (!frame) return;
    setCapture(frame, makeThumb(frame));
    setMode("export");
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
          s.setMode("export");
        },
        onError: () => {
          recorderRef.current = null;
          useAppStore.getState().setRecording(false);
        },
      });
      return;
    }

    // Dedicated recording canvas at the selected video export resolution —
    // recorded WebM matches export settings, not the on-screen preview size.
    const { w: sw, h: sh } = intrinsicSize(media);
    const [tw, th] = targetDims(state.videoResolution, sw, sh);
    const recCanvas = document.createElement("canvas");
    recCanvas.width = tw;
    recCanvas.height = th;
    const recCtx = recCanvas.getContext("2d")!;

    // Reusable native-frame buffer at source resolution.
    const nativeCanvas = document.createElement("canvas");
    nativeCanvas.width = Math.max(1, sw);
    nativeCanvas.height = Math.max(1, sh);
    const nativeCtx = nativeCanvas.getContext("2d")!;

    const drawLoop = (time: number) => {
      const s = useAppStore.getState();
      const media2 = s.mediaImage ?? s.mediaVideo;
      if (media2) {
        // 1) render media + effects at source res, 2) fit/crop into target.
        renderFrame(nativeCtx, media2, s.effects, sw, sh, time);
        drawFramed(recCtx, nativeCanvas, sw, sh, tw, th, { mode: s.videoFraming });
      }
      recordRafRef.current = requestAnimationFrame(drawLoop);
    };
    // Prime the native buffer + first framed draw synchronously.
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
        s.setMode("export");
      },
      onError: () => {
        stopLoop();
        recorderRef.current = null;
        useAppStore.getState().setRecording(false);
      },
    });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
      {/* Brand */}
      <div className="flex items-center gap-3.5">
        <Logo />
        <div className="flex items-baseline gap-3.5">
          <span className="text-[22px] font-semibold leading-none tracking-tight text-linen">
            Efektly
          </span>
          <span className="hidden text-[13px] leading-none text-linen/40 sm:inline">
            Upload. Stylize. Export.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="subtle" icon={<Undo2 className="size-4" />}>
            Undo
          </Button>
          <Button variant="subtle" icon={<Redo2 className="size-4" />}>
            Redo
          </Button>
        </div>

        <div className="mx-1.5 hidden h-6 w-px bg-white/[0.08] md:block" />

        <Button
          icon={<Camera className="size-4" />}
          onClick={handleCapture}
          disabled={!canCapture || isRecording}
        >
          Capture
        </Button>

        <Button
          onClick={handleRecord}
          disabled={!canCapture}
          aria-pressed={isRecording}
          className={
            isRecording
              ? "border border-flame/60 bg-flame/15 text-flame"
              : undefined
          }
          icon={
            isRecording ? (
              <Square className="size-3.5 fill-flame text-flame" />
            ) : (
              <Circle className="size-4 fill-flame text-flame" />
            )
          }
        >
          {isRecording ? formatClock(recordElapsedMs) : "Record"}
        </Button>

        <Button
          variant="primary"
          icon={<Upload className="size-4" />}
          onClick={() => setMode("export")}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
