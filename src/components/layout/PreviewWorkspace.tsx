import { Maximize2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { usePreviewZoom } from "../preview/usePreviewZoom";
import { PreviewStage } from "../preview/PreviewStage";
import { PreviewZoomControls } from "../preview/PreviewZoomControls";
import { MediaVideoControls } from "../media/MediaVideoControls";

/* ------------------------------------------------------------------ */
/*  Current-layout host for the Live Preview: header (label, Realtime  */
/*  in shader mode, zoom cluster), the stage, and the video transport.  */
/*  Stage + zoom behavior live in PreviewStage / usePreviewZoom so     */
/*  other shells can host them too.                                    */
/* ------------------------------------------------------------------ */

export function PreviewWorkspace() {
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
      el.requestFullscreen().catch(() => {
        /* fullscreen unsupported / blocked — ignore */
      });
    }
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col p-5">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-linen">
            Live Preview
          </span>
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
        <div className="flex items-center gap-2">
          <PreviewZoomControls
            zoom={zoomApi.zoom}
            onZoom={zoomApi.zoomTo}
            onFit={zoomApi.fit}
          />
          <button
            aria-label="Fullscreen preview"
            onClick={toggleFullscreen}
            className="grid size-9 place-items-center rounded-lg text-linen/45 transition-colors hover:bg-linen/[0.06] hover:text-linen"
          >
            <Maximize2 className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <PreviewStage zoomApi={zoomApi} />

      {/* Slim video control bar — only for video media */}
      {isVideo && (
        <div className="mt-4 shrink-0">
          <MediaVideoControls />
        </div>
      )}
    </main>
  );
}
