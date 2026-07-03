/* ------------------------------------------------------------------ */
/*  Preview canvas registry.                                           */
/*  The live PreviewCanvas registers its <canvas> here so Capture,     */
/*  Export, and Record can read the current output imperatively        */
/*  without prop-drilling or triggering React re-renders.              */
/* ------------------------------------------------------------------ */

let current: HTMLCanvasElement | null = null;

export function setPreviewCanvas(canvas: HTMLCanvasElement | null): void {
  current = canvas;
}

export function getPreviewCanvas(): HTMLCanvasElement | null {
  return current;
}
