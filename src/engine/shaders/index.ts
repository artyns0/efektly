import type {
  ShaderAnimation,
  ShaderSettingsMap,
  ShaderTypeId,
} from "../../types/shaders";
import { renderDotGrid } from "./dotGrid";
import { renderMeshLiquid } from "./meshLiquid";
import { renderVoronoi } from "./voronoi";
import { renderParticles } from "./particles";
import { renderLiquidGlass } from "./liquidGlass";
import { renderLiquidSilk } from "./liquidSilk";
import { renderFluidLines } from "./fluidLines";
import { renderInkFlow } from "./inkFlow";
import { renderPlasmaGradient } from "./plasmaGradient";
import { renderOrbitParticles } from "./orbitParticles";
import { renderKineticStripes } from "./kineticStripes";
import { renderSparkBurst } from "./sparkBurst";
import { renderKineticLines } from "./kineticLines";
import { renderAuraOrb } from "./auraOrb";

/* ------------------------------------------------------------------ */
/*  Shader dispatcher — routes to the active procedural renderer.      */
/* ------------------------------------------------------------------ */

/** Which shaders are fully implemented (vs. simple v1 placeholders). */
export const IMPLEMENTED_SHADERS: ReadonlySet<ShaderTypeId> = new Set([
  "dotGrid",
  "liquidGlass",
  "liquidSilk",
  "fluidLines",
  "inkFlow",
  "plasmaGradient",
  "orbitParticles",
  "kineticStripes",
  "sparkBurst",
  "kineticLines",
  "auraOrb",
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
    case "liquidGlass":
      renderLiquidGlass(ctx, w, h, settings.liquidGlass, timeSec);
      break;
    case "liquidSilk":
      renderLiquidSilk(ctx, w, h, settings.liquidSilk, timeSec);
      break;
    case "fluidLines":
      renderFluidLines(ctx, w, h, settings.fluidLines, timeSec);
      break;
    case "inkFlow":
      renderInkFlow(ctx, w, h, settings.inkFlow, timeSec);
      break;
    case "plasmaGradient":
      renderPlasmaGradient(ctx, w, h, settings.plasmaGradient, timeSec);
      break;
    case "orbitParticles":
      renderOrbitParticles(ctx, w, h, settings.orbitParticles, timeSec);
      break;
    case "kineticStripes":
      renderKineticStripes(ctx, w, h, settings.kineticStripes, timeSec);
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
  }
}
