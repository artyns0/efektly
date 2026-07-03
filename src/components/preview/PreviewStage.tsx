import { useAppStore } from "../../store/useAppStore";
import { PreviewPlaceholder } from "./PreviewPlaceholder";
import { PreviewCanvas } from "./PreviewCanvas";
import { ShaderCanvas } from "./ShaderCanvas";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import type { PreviewZoomApi } from "./usePreviewZoom";

/* ------------------------------------------------------------------ */
/*  The Live Preview stage: grid background, zoomable/pannable         */
/*  viewport, canvas selection (shader / media / placeholder) behind    */
/*  the error boundary, and the soft inner edge. Layout-agnostic —      */
/*  any shell can host it by passing the usePreviewZoom api.           */
/* ------------------------------------------------------------------ */

export function PreviewStage({ zoomApi }: { zoomApi: PreviewZoomApi }) {
  const mode = useAppStore((s) => s.mode);
  const gridVisible = useAppStore((s) => s.gridVisible);
  const mediaImage = useAppStore((s) => s.mediaImage);
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  const activeSource = mediaImage ?? mediaVideo;

  const { stageRef, scrollRef, base, zoom } = zoomApi;

  return (
    <div
      ref={stageRef}
      className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/[0.05] bg-onyx-50 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(243,240,232,0.05)]"
    >
      {/* Subtle grid background */}
      {gridVisible && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(243,240,232,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(243,240,232,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 78% 78% at 50% 50%, black 52%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 78% at 50% 50%, black 52%, transparent 100%)",
          }}
        />
      )}

      {/* Zoomable / pannable viewport. The canvas renders at the base stage
          size; zoom is a CSS transform (inspection only — never affects
          export resolution). Content scrolls to pan when zoomed in. */}
      <div
        ref={scrollRef}
        className="scroll-thin absolute inset-0 grid overflow-auto"
        style={{ placeContent: "safe center" }}
      >
        <div
          style={{
            width: base.w ? base.w * zoom : "100%",
            height: base.h ? base.h * zoom : "100%",
          }}
        >
          <div
            style={{
              width: base.w || "100%",
              height: base.h || "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <PreviewErrorBoundary>
              {mode === "shader" ? (
                <ShaderCanvas />
              ) : activeSource ? (
                <PreviewCanvas
                  key={mediaImage ? "image" : "video"}
                  source={activeSource}
                />
              ) : (
                <PreviewPlaceholder />
              )}
            </PreviewErrorBoundary>
          </div>
        </div>
      </div>

      {/* Refined inner edge — soft, not a heavy border */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_0_1px_rgba(243,240,232,0.04),inset_0_0_140px_30px_rgba(0,0,0,0.45)]" />
    </div>
  );
}
