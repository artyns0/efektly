import { useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { PreviewPlaceholder } from "../preview/PreviewPlaceholder";
import { PreviewCanvas } from "../preview/PreviewCanvas";
import { ShaderCanvas } from "../preview/ShaderCanvas";
import { PreviewZoomControls } from "../preview/PreviewZoomControls";
import { PreviewErrorBoundary } from "../preview/PreviewErrorBoundary";
import { MediaVideoControls } from "../media/MediaVideoControls";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export function PreviewWorkspace() {
  const mode = useAppStore((s) => s.mode);
  const gridVisible = useAppStore((s) => s.gridVisible);
  const mediaImage = useAppStore((s) => s.mediaImage);
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  const previewZoom = useAppStore((s) => s.previewZoom);
  const setPreviewZoom = useAppStore((s) => s.setPreviewZoom);
  const activeSource = mediaImage ?? mediaVideo;
  const isVideo = mediaVideo !== null;
  const showRealtime = mode === "shader";

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(previewZoom);
  zoomRef.current = previewZoom;

  // Base (unzoomed) stage size — the canvas always renders at this size,
  // zoom is a pure CSS transform so it never changes render/export resolution.
  const [base, setBase] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setBase({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Set zoom, keeping the anchor viewport point (default center) stable. */
  const zoomTo = (next: number, anchor?: { x: number; y: number }) => {
    const el = scrollRef.current;
    const old = zoomRef.current;
    const clamped = clampZoom(next);
    if (clamped === old) return;
    if (el) {
      const ax = anchor?.x ?? el.clientWidth / 2;
      const ay = anchor?.y ?? el.clientHeight / 2;
      const cx = (el.scrollLeft + ax) / old;
      const cy = (el.scrollTop + ay) / old;
      setPreviewZoom(clamped);
      requestAnimationFrame(() => {
        el.scrollLeft = cx * clamped - ax;
        el.scrollTop = cy * clamped - ay;
      });
    } else {
      setPreviewZoom(clamped);
    }
  };

  const fit = () => {
    setPreviewZoom(1);
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  };

  // Ctrl/Cmd + wheel zoom; non-passive so the browser page zoom is blocked.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoomTo(zoomRef.current * factor, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <PreviewZoomControls zoom={previewZoom} onZoom={zoomTo} onFit={fit} />
          <button
            aria-label="Fullscreen preview"
            className="grid size-9 place-items-center rounded-lg text-linen/45 transition-colors hover:bg-linen/[0.06] hover:text-linen"
          >
            <Maximize2 className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Stage */}
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
              width: base.w ? base.w * previewZoom : "100%",
              height: base.h ? base.h * previewZoom : "100%",
            }}
          >
            <div
              style={{
                width: base.w || "100%",
                height: base.h || "100%",
                transform: `scale(${previewZoom})`,
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

      {/* Slim video control bar — only for video media */}
      {isVideo && (
        <div className="mt-4 shrink-0">
          <MediaVideoControls />
        </div>
      )}
    </main>
  );
}
