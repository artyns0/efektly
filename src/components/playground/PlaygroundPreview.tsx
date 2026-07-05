import { ChevronDown, Maximize2, Play } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { usePreviewZoom } from "../preview/usePreviewZoom";
import { PreviewStage } from "../preview/PreviewStage";
import { PreviewZoomControls } from "../preview/PreviewZoomControls";
import { MediaVideoControls } from "../media/MediaVideoControls";

/* Playground v2 preview host: "Live" label, Fit dropdown placeholder,
   zoom cluster + fullscreen top-right, stage, video transport below. */

export function PlaygroundPreview() {
  const mode = useAppStore((s) => s.mode);
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  const isVideo = mediaVideo !== null;
  const showRealtime = mode === "shader";

  const zoomApi = usePreviewZoom();

  const toggleFullscreen = () => {
    const el = zoomApi.stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex size-full min-w-0 flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.02] to-transparent p-3 shadow-xl shadow-black/30">
      {/* Header */}
      <div className="mb-3 flex shrink-0 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Play className="size-3.5 fill-flame text-flame" />
          <span className="text-[13px] font-medium text-linen">Live</span>
          {showRealtime && (
            <span className="flex items-center gap-1.5 text-xs text-linen/55">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-flame/60" />
                <span className="relative inline-flex size-2 rounded-full bg-flame" />
              </span>
              Realtime
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled
            className="inline-flex h-7 cursor-not-allowed items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 text-[11px] font-medium text-linen/45"
          >
            Fit
            <ChevronDown className="size-3.5" />
          </button>
          <PreviewZoomControls
            zoom={zoomApi.zoom}
            onZoom={zoomApi.zoomTo}
            onFit={zoomApi.fit}
          />
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
      <PreviewStage zoomApi={zoomApi} />

      {/* Video transport */}
      {isVideo && (
        <div className="mt-3 shrink-0">
          <MediaVideoControls />
        </div>
      )}
    </div>
  );
}
