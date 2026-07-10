import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/useAppStore";
import { setPreviewCanvas } from "../../engine/preview/canvasRegistry";
import {
  applyEffect,
  computeFit,
  drawBase,
  effectAnimates,
  type FitRect,
  type MediaEl,
} from "../../engine/pipeline";
import { setFrameContext } from "../../engine/effects/temporalContext";

/* ------------------------------------------------------------------ */
/*  Real canvas preview of the uploaded image or video.               */
/*  Effects chain in stack order. Images bake the static prefix into a  */
/*  cache and animate only the tail; videos redraw the whole stack per  */
/*  frame while playing (and while an animated effect runs).           */
/* ------------------------------------------------------------------ */

export function PreviewCanvas({ source }: { source: MediaEl }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effects = useAppStore((s) => s.effects);

  // Register this canvas so Capture / Export / Record can read the output.
  useEffect(() => {
    setPreviewCanvas(canvasRef.current);
    return () => setPreviewCanvas(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isVideo = source instanceof HTMLVideoElement;
    const enabled = effects.filter((fx) => fx.enabled);

    let raf = 0;
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      // Use layout size (clientWidth/Height) rather than getBoundingClientRect
      // so an ancestor CSS zoom transform never changes the render resolution —
      // preview zoom scales visually only, keeping export/render independent.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ---------------------------------------------------------------- */
    /*  Video: redraw the whole stack per frame.                        */
    /* ---------------------------------------------------------------- */
    if (isVideo) {
      const video = source;

      // Paint the current frame + effects immediately (no RAF wait), so
      // seeking/pausing updates the canvas even when the tab throttles RAF.
      const drawOnce = (time: number) => {
        if (video.videoWidth === 0 || cssW === 0) return;
        const fit = computeFit(video, { width: cssW, height: cssH });
        if (!fit) return;
        // Temporal effects key off the media timeline, not the wall clock, so a
        // seek/loop resets their frame history rather than smearing across it.
        setFrameContext({
          mediaTimeMs: video.currentTime * 1000,
          resetToken: video.currentSrc || "video",
          playing: !video.paused && !video.ended,
          isVideo: true,
        });
        ctx.clearRect(0, 0, cssW, cssH);
        drawBase(ctx, video, fit);
        for (const fx of enabled) applyEffect(ctx, fx, fit, dpr, time);
      };

      const loop = (time: number) => {
        drawOnce(time);
        const keepGoing =
          (!video.paused && !video.ended) || enabled.some(effectAnimates);
        if (keepGoing) raf = requestAnimationFrame(loop);
      };

      const kick = () => {
        cancelAnimationFrame(raf);
        drawOnce(performance.now()); // immediate synchronous paint
        const keepGoing =
          (!video.paused && !video.ended) || enabled.some(effectAnimates);
        if (keepGoing) raf = requestAnimationFrame(loop);
      };

      resize();
      kick();

      const events = ["play", "pause", "seeked", "timeupdate", "loadeddata", "ended"];
      events.forEach((e) => video.addEventListener(e, kick));
      const observer = new ResizeObserver(() => {
        resize();
        kick();
      });
      observer.observe(canvas);

      return () => {
        cancelAnimationFrame(raf);
        events.forEach((e) => video.removeEventListener(e, kick));
        observer.disconnect();
      };
    }

    /* ---------------------------------------------------------------- */
    /*  Image: bake static prefix, animate the tail.                    */
    /* ---------------------------------------------------------------- */
    const cache = document.createElement("canvas");
    const cacheCtx = cache.getContext("2d");
    let fit: FitRect | null = null;

    let split = enabled.findIndex(effectAnimates);
    if (split === -1) split = enabled.length;
    const staticPart = enabled.slice(0, split);
    const animatedPart = enabled.slice(split);

    const renderStatic = () => {
      resize();
      ctx.clearRect(0, 0, cssW, cssH);
      fit = computeFit(source, { width: cssW, height: cssH });
      if (!fit) return;
      // Still image: mark the source as non-video so video-only effects show
      // their notice instead of processing a single frame.
      setFrameContext({
        mediaTimeMs: 0,
        resetToken: "image",
        playing: false,
        isVideo: false,
      });
      drawBase(ctx, source, fit);
      const now = performance.now();
      for (const fx of staticPart) applyEffect(ctx, fx, fit, dpr, now);

      cache.width = canvas.width;
      cache.height = canvas.height;
      cacheCtx?.clearRect(0, 0, cache.width, cache.height);
      cacheCtx?.drawImage(canvas, 0, 0);
    };

    const frame = (time: number) => {
      if (!fit || animatedPart.length === 0) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cache, 0, 0);
      ctx.restore();
      for (const fx of animatedPart) applyEffect(ctx, fx, fit, dpr, time);
      if (animatedPart.some(effectAnimates)) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      renderStatic();
      if (animatedPart.length > 0) frame(performance.now());
    };

    start();
    const observer = new ResizeObserver(start);
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [source, effects]);

  return <canvas ref={canvasRef} className="block size-full" />;
}
