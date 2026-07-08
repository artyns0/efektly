import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlignJustify,
  CircleDot,
  Gem,
  CloudFog,
  Droplets,
  Grid2x2,
  Hexagon,
  Orbit,
  Radar,
  Ribbon,
  Sparkles,
  Star,
  Sun,
  Waves,
} from "lucide-react";
import { cn } from "../../../lib/cn";
import { useAppStore } from "../../../store/useAppStore";
import { SHADER_TYPES } from "../../../data/shaders";
import type { ShaderTypeId } from "../../../types/shaders";

const ICONS: Record<ShaderTypeId, LucideIcon> = {
  meshLiquid: Waves,
  dotGrid: Grid2x2,
  voronoi: Hexagon,
  particles: Sparkles,
  liquidGlass: Droplets,
  liquidSilk: Ribbon,
  fluidLines: Activity,
  inkFlow: CloudFog,
  plasmaGradient: Sun,
  orbitParticles: Orbit,
  kineticStripes: AlignJustify,
  sparkBurst: Star,
  kineticLines: Radar,
  auraOrb: CircleDot,
  holoyudu: Gem,
};

export function ShaderTypeSelector() {
  const shaderType = useAppStore((s) => s.shaderType);
  const setShaderType = useAppStore((s) => s.setShaderType);

  return (
    <div className="flex flex-col gap-1">
      {SHADER_TYPES.map((t) => {
        const Icon = ICONS[t.id];
        const active = shaderType === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setShaderType(t.id)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              active
                ? "border-flame/50 bg-flame/12 text-flame"
                : "border-transparent bg-[#141414] text-linen/70 hover:bg-[#1a1a1a] hover:text-linen",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.85} />
            <span className="flex-1 text-[13px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
