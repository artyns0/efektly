import { useRef } from "react";
import { Maximize2, Move3d } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { usePreviewZoom } from "../preview/usePreviewZoom";
import { PreviewStage } from "../preview/PreviewStage";
import { PreviewZoomControls } from "../preview/PreviewZoomControls";
import { MediaVideoControls } from "../media/MediaVideoControls";
import { ThreeViewport } from "../three/ThreeViewport";

/* Playground v2 preview host: "Live" label, zoom cluster + fullscreen
   top-right, stage, video transport below. In 3D mode the stage becomes a
   real-time Three.js viewport with orbit controls. */

export function PlaygroundPreview() {
  const mode = useAppStore((s) => s.mode);
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  const isVideo = mediaVideo !== null;
  const is3D = mode === "three";
  const showRealtime = mode === "shader" || is3D;

  const zoomApi = usePreviewZoom();
  const threeStageRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    const el = is3D ? threeStageRef.current : zoomApi.stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex size-full min-w-0 flex-col rounded-xl border border-white/[0.06] bg-[#0e0e0e] p-3">
      {/* Header */}
      <div className="mb-3 flex shrink-0 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {showRealtime ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-linen/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-flame/60" />
                <span className="relative inline-flex size-2 rounded-full bg-flame" />
              </span>
              {is3D ? "3D · Live" : "Shader · Live"}
            </span>
          ) : (
            <span className="text-[13px] font-medium text-linen/50">Preview</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {is3D ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 text-[11px] font-medium text-linen/45">
              <Move3d className="size-3.5" />
              Drag to orbit · scroll to zoom
            </span>
          ) : (
            <PreviewZoomControls
              zoom={zoomApi.zoom}
              onZoom={zoomApi.zoomTo}
              onFit={zoomApi.fit}
            />
          )}
          <button
            aria-label="Fullscreen preview"
            onClick={toggleFullscreen}
            className="grid size-8 place-items-center rounded-lg text-linen/45 transition-colors hover:bg-linen/[0.06] hover:text-linen"
          >
            <Maximize2 className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Stage */}
      {is3D ? (
        <div
          ref={threeStageRef}
          className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/[0.05] bg-black"
        >
          <ThreeViewport />
        </div>
      ) : (
        <PreviewStage zoomApi={zoomApi} />
      )}

      {/* Video transport */}
      {!is3D && isVideo && (
        <div className="mt-3 shrink-0">
          <MediaVideoControls />
        </div>
      )}
    </div>
  );
}
