import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Placeholder "flowing mesh" visual.                                 */
/*  Canvas 2D, additive: a domain-warped grid whose rows/columns drift */
/*  and breathe. Lines are tinted flame -> cream across the field,      */
/*  glowing nodes sit at the warp peaks, over an onyx ground with a     */
/*  warm key light and a cool counter-glow. Purely decorative for the   */
/*  UI shell — the real effect/shader engine replaces it later.        */
/* ------------------------------------------------------------------ */

const COLS = 22; // vertical mesh lines
const ROWS = 14; // horizontal mesh lines

// Mix flame (#FF5A1F warmed) -> cream (#F3F0E8) by t in [0,1].
function meshColor(t: number, alpha: number): string {
  const r = Math.round(255 + (243 - 255) * t);
  const g = Math.round(120 + (240 - 120) * t);
  const b = Math.round(70 + (232 - 70) * t);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeSprite(kind: "flame" | "cream"): HTMLCanvasElement {
  const size = 40;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (kind === "flame") {
    grad.addColorStop(0, "rgba(255,228,200,1)");
    grad.addColorStop(0.32, "rgba(255,90,31,0.6)");
    grad.addColorStop(1, "rgba(255,90,31,0)");
  } else {
    grad.addColorStop(0, "rgba(255,253,247,1)");
    grad.addColorStop(0.4, "rgba(243,240,232,0.5)");
    grad.addColorStop(1, "rgba(243,240,232,0)");
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function PreviewPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = { flame: makeSprite("flame"), cream: makeSprite("cream") };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Domain-warped displacement field. Returns the on-screen point for a
    // normalized grid coordinate (u, v) at time t — layered sines give the
    // soft, organic "cloth in wind" flow.
    const warp = (u: number, v: number, t: number) => {
      const m = Math.min(width, height);
      const amp = m * 0.05;
      const dx =
        Math.sin(u * 3.1 + v * 2.2 + t * 0.5) +
        0.5 * Math.sin(v * 4.4 - t * 0.7 + 1.3);
      const dy =
        Math.cos(v * 3.6 + u * 1.8 - t * 0.6) +
        0.5 * Math.cos(u * 5.0 + t * 0.45 + 2.1);
      // gentle global swell so the whole sheet breathes
      const swell = 0.6 + 0.4 * Math.sin(t * 0.35 + u * 1.5);
      // inset the sheet so it floats inside the stage
      const px = (0.08 + u * 0.84) * width + dx * amp * swell;
      const py = (0.1 + v * 0.8) * height + dy * amp * swell;
      return { px, py };
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      /* --- ground: warm key light + cool counter-glow --- */
      const warm = ctx.createRadialGradient(
        width * 0.68, height * 0.32, 0,
        width * 0.68, height * 0.32, Math.max(width, height) * 0.8,
      );
      warm.addColorStop(0, "rgba(255,90,31,0.16)");
      warm.addColorStop(0.5, "rgba(255,90,31,0.05)");
      warm.addColorStop(1, "rgba(255,90,31,0)");
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, width, height);

      const cool = ctx.createRadialGradient(
        width * 0.18, height * 0.84, 0,
        width * 0.18, height * 0.84, Math.max(width, height) * 0.6,
      );
      cool.addColorStop(0, "rgba(243,240,232,0.06)");
      cool.addColorStop(1, "rgba(243,240,232,0)");
      ctx.fillStyle = cool;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /* --- 1. horizontal mesh lines (rows) --- */
      for (let j = 0; j <= ROWS; j++) {
        const v = j / ROWS;
        ctx.beginPath();
        for (let i = 0; i <= COLS; i++) {
          const { px, py } = warp(i / COLS, v, t);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const fade = Math.sin(v * Math.PI); // dim toward top/bottom edges
        ctx.shadowBlur = 10;
        ctx.shadowColor = meshColor(v, 0.6);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = meshColor(v, 0.16 + 0.22 * fade);
        ctx.stroke();
      }

      /* --- 2. vertical mesh lines (columns) --- */
      for (let i = 0; i <= COLS; i++) {
        const u = i / COLS;
        ctx.beginPath();
        for (let j = 0; j <= ROWS; j++) {
          const { px, py } = warp(u, j / ROWS, t);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const fade = Math.sin(u * Math.PI);
        ctx.shadowBlur = 8;
        ctx.shadowColor = meshColor(u, 0.5);
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = meshColor(u, 0.1 + 0.16 * fade);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      /* --- 3. glowing nodes riding the warp peaks --- */
      for (let j = 0; j <= ROWS; j += 1) {
        const v = j / ROWS;
        for (let i = 0; i <= COLS; i += 1) {
          const u = i / COLS;
          // light only the nodes near a moving wavefront, so highlights travel
          const pulse = Math.sin(u * 3.1 + v * 2.2 + t * 0.5);
          if (pulse < 0.45) continue;
          const { px, py } = warp(u, v, t);
          const env = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
          const a = (pulse - 0.45) * env * 0.9;
          if (a < 0.02) continue;
          const sprite = v < 0.5 ? sprites.flame : sprites.cream;
          const s = 6 + 12 * (pulse - 0.45);
          ctx.globalAlpha = a;
          ctx.drawImage(sprite, px - s / 2, py - s / 2, s, s);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* --- 4. onyx depth: vignette + floor shadow --- */
      const vignette = ctx.createRadialGradient(
        width * 0.5, height * 0.48, Math.min(width, height) * 0.32,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.78,
      );
      vignette.addColorStop(0, "rgba(11,11,11,0)");
      vignette.addColorStop(1, "rgba(7,7,7,0.6)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      const floor = ctx.createLinearGradient(0, height * 0.6, 0, height);
      floor.addColorStop(0, "rgba(7,7,7,0)");
      floor.addColorStop(1, "rgba(7,7,7,0.5)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, width, height);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    start = performance.now();
    raf = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="block size-full" />;
}
