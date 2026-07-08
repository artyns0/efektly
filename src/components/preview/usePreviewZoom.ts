import { useCallback, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";

/* ------------------------------------------------------------------ */
/*  Preview zoom behavior, extracted so any layout shell can host the  */
/*  stage without duplicating the fragile zoom/canvas-sizing logic.    */
/*                                                                     */
/*  Uses callback refs so the ResizeObserver and wheel listener always  */
/*  rebind to the *current* stage/scroll node — the stage can unmount   */
/*  and remount (e.g. switching to/from 3D mode) without leaving `base`  */
/*  stale or the observer bound to a detached node.                     */
/* ------------------------------------------------------------------ */

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export interface PreviewZoomApi {
  zoom: number;
  /** Base (unzoomed) stage size in CSS px. */
  base: { w: number; h: number };
  stageRef: React.RefObject<HTMLDivElement | null>;
  /** Callback ref for the stage container element. */
  setStageEl: (node: HTMLDivElement | null) => void;
  /** Callback ref for the overflow-auto viewport element. */
  setScrollEl: (node: HTMLDivElement | null) => void;
  /** Set zoom, keeping the anchor viewport point (default center) stable. */
  zoomTo: (next: number, anchor?: { x: number; y: number }) => void;
  /** Reset to 100% and recenter. */
  fit: () => void;
}

export function usePreviewZoom(): PreviewZoomApi {
  const previewZoom = useAppStore((s) => s.previewZoom);
  const setPreviewZoom = useAppStore((s) => s.setPreviewZoom);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const wheelElRef = useRef<HTMLDivElement | null>(null);

  const zoomRef = useRef(previewZoom);
  zoomRef.current = previewZoom;

  const [base, setBase] = useState({ w: 0, h: 0 });

  const zoomTo = useCallback(
    (next: number, anchor?: { x: number; y: number }) => {
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
    },
    [setPreviewZoom],
  );

  const fit = useCallback(() => {
    setPreviewZoom(1);
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [setPreviewZoom]);

  // Callback ref: (re)bind the ResizeObserver to whatever stage node is live.
  const setStageEl = useCallback((node: HTMLDivElement | null) => {
    stageRef.current = node;
    roRef.current?.disconnect();
    roRef.current = null;
    if (!node) return;
    const measure = () => {
      // Ignore zero measurements from a detaching node so `base` never
      // collapses when the stage unmounts.
      if (node.clientWidth > 0 && node.clientHeight > 0) {
        setBase({ w: node.clientWidth, h: node.clientHeight });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    roRef.current = ro;
  }, []);

  // Callback ref: (re)bind the Ctrl/Cmd+wheel zoom listener.
  const setScrollEl = useCallback(
    (node: HTMLDivElement | null) => {
      const prev = wheelElRef.current;
      if (prev) prev.onwheel = null;
      scrollRef.current = node;
      wheelElRef.current = node;
      if (!node) return;
      node.onwheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const rect = node.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        zoomTo(zoomRef.current * factor, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      };
    },
    [zoomTo],
  );

  return { zoom: previewZoom, base, stageRef, setStageEl, setScrollEl, zoomTo, fit };
}
