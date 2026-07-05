import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/useAppStore";
import { setPreviewCanvas } from "../../engine/preview/canvasRegistry";
import { renderShader } from "../../engine/shaders";
import { setSparkPointer } from "../../engine/shaders/sparkBurst";

/* ------------------------------------------------------------------ */
/*  Procedural shader output on the Live Preview canvas.               */
/*  No media needed. Runs a RAF loop while animation is enabled;       */
/*  otherwise renders a single static frame. Registers its canvas so   */
/*  Capture / Record can read the output.                             */
/* ------------------------------------------------------------------ */

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shaderType = useAppStore((s) => s.shaderType);
  const shaderSettings = useAppStore((s) => s.shaderSettings);
  const shaderAnimation = useAppStore((s) => s.shaderAnimation);

  useEffect(() => {
    setPreviewCanvas(canvasRef.current);
    return () => setPreviewCanvas(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      if (w === 0 || h === 0) return;
      renderShader(ctx, w, h, shaderType, shaderSettings, shaderAnimation, time);
      if (shaderAnimation.animate) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(performance.now());

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      resize();
      draw(performance.now());
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [shaderType, shaderSettings, shaderAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className="block size-full"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setSparkPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => setSparkPointer(null)}
    />
  );
}
