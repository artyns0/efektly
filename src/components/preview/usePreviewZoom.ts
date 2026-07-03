import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Preview zoom behavior, extracted so any layout shell can host the  */
/*  stage without duplicating the fragile zoom/canvas-sizing logic.    */
/*                                                                     */
/*  Contract:                                                          */
/*  - `stageRef` goes on the stage container (its size = base size;    */
/*    the canvas renders at base size, zoom is a pure CSS transform    */
/*    so render/export resolution is never affected).                  */
/*  - `scrollRef` goes on the overflow-auto viewport inside the stage; */
/*    the Ctrl/Cmd+wheel listener attaches there (non-passive, so      */
/*    browser page zoom is blocked over the preview).                  */
/* ------------------------------------------------------------------ */

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export interface PreviewZoomApi {
  zoom: number;
  /** Base (unzoomed) stage size in CSS px. */
  base: { w: number; h: number };
  stageRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Set zoom, keeping the anchor viewport point (default center) stable. */
  zoomTo: (next: number, anchor?: { x: number; y: number }) => void;
  /** Reset to 100% and recenter. */
  fit: () => void;
}

export function usePreviewZoom(): PreviewZoomApi {
  const previewZoom = useAppStore((s) => s.previewZoom);
  const setPreviewZoom = useAppStore((s) => s.setPreviewZoom);

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(previewZoom);
  zoomRef.current = previewZoom;

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
      // After React re-renders the resized content, restore the anchor.
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

  return { zoom: previewZoom, base, stageRef, scrollRef, zoomTo, fit };
}
