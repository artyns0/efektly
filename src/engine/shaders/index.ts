import type {
  ShaderAnimation,
  ShaderSettingsMap,
  ShaderTypeId,
} from "../../types/shaders";
import { renderDotGrid } from "./dotGrid";
import { renderMeshLiquid } from "./meshLiquid";
import { renderVoronoi } from "./voronoi";
import { renderParticles } from "./particles";
import { renderFluidLines } from "./fluidLines";
import { renderInkFlow } from "./inkFlow";
import { renderOrbitParticles } from "./orbitParticles";
import { renderSparkBurst } from "./sparkBurst";
import { renderKineticLines } from "./kineticLines";
import { renderAuraOrb } from "./auraOrb";
import { renderHoloyudu } from "./holoyudu";
import { renderNebulas } from "./nebulas";

/* ------------------------------------------------------------------ */
/*  Shader dispatcher — routes to the active procedural renderer.      */
/* ------------------------------------------------------------------ */

/** Which shaders are fully implemented (vs. simple v1 placeholders). */
export const IMPLEMENTED_SHADERS: ReadonlySet<ShaderTypeId> = new Set([
  "dotGrid",
  "fluidLines",
  "inkFlow",
  "orbitParticles",
  "sparkBurst",
  "kineticLines",
  "auraOrb",
  "holoyudu",
  "nebulas",
]);

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

  switch (type) {
    case "dotGrid":
      renderDotGrid(ctx, w, h, settings.dotGrid, timeSec);
      break;
    case "meshLiquid":
      renderMeshLiquid(ctx, w, h, settings.meshLiquid, timeSec);
      break;
    case "voronoi":
      renderVoronoi(ctx, w, h, settings.voronoi, timeSec);
      break;
    case "particles":
      renderParticles(ctx, w, h, settings.particles, timeSec);
      break;
    case "fluidLines":
      renderFluidLines(ctx, w, h, settings.fluidLines, timeSec);
      break;
    case "inkFlow":
      renderInkFlow(ctx, w, h, settings.inkFlow, timeSec);
      break;
    case "orbitParticles":
      renderOrbitParticles(ctx, w, h, settings.orbitParticles, timeSec);
      break;
    case "sparkBurst":
      renderSparkBurst(ctx, w, h, settings.sparkBurst, timeSec);
      break;
    case "kineticLines":
      renderKineticLines(ctx, w, h, settings.kineticLines, timeSec);
      break;
    case "auraOrb":
      renderAuraOrb(ctx, w, h, settings.auraOrb, timeSec);
      break;
    case "holoyudu":
      renderHoloyudu(ctx, w, h, settings.holoyudu, timeSec);
      break;
    case "nebulas":
      renderNebulas(ctx, w, h, settings.nebulas, timeSec);
      break;
  }
}
