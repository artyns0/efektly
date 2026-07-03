import type {
  ShaderAnimation,
  ShaderSettingsMap,
  ShaderTypeId,
} from "../../types/shaders";
import { renderDotGrid } from "./dotGrid";
import { renderMeshLiquid } from "./meshLiquid";
import { renderVoronoi } from "./voronoi";
import { renderParticles } from "./particles";

/* ------------------------------------------------------------------ */
/*  Shader dispatcher — routes to the active procedural renderer.      */
/* ------------------------------------------------------------------ */

/** Which shaders are fully implemented (vs. simple v1 placeholders). */
export const IMPLEMENTED_SHADERS: ReadonlySet<ShaderTypeId> = new Set(["dotGrid"]);

export function renderShader(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: ShaderTypeId,
  settings: ShaderSettingsMap,
  anim: ShaderAnimation,
  timeMs: number,
): void {
  // Global time scaled by the animation speed (frozen when not animating).
  const timeSec = (anim.animate ? timeMs : 0) * 0.001 * anim.speed;
  const motion = anim.motionStyle;

  switch (type) {
    case "dotGrid":
      renderDotGrid(ctx, w, h, settings.dotGrid, timeSec, motion);
      break;
    case "meshLiquid":
      renderMeshLiquid(ctx, w, h, settings.meshLiquid, timeSec, motion);
      break;
    case "voronoi":
      renderVoronoi(ctx, w, h, settings.voronoi, timeSec, motion);
      break;
    case "particles":
      renderParticles(ctx, w, h, settings.particles, timeSec, motion);
      break;
  }
}
