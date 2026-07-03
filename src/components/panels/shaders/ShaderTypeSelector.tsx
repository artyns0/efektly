import type { LucideIcon } from "lucide-react";
import { Grid2x2, Hexagon, Sparkles, Waves } from "lucide-react";
import { cn } from "../../../lib/cn";
import { useAppStore } from "../../../store/useAppStore";
import { SHADER_TYPES } from "../../../data/shaders";
import { IMPLEMENTED_SHADERS } from "../../../engine/shaders";
import type { ShaderTypeId } from "../../../types/shaders";

const ICONS: Record<ShaderTypeId, LucideIcon> = {
  meshLiquid: Waves,
  dotGrid: Grid2x2,
  voronoi: Hexagon,
  particles: Sparkles,
};

export function ShaderTypeSelector() {
  const shaderType = useAppStore((s) => s.shaderType);
  const setShaderType = useAppStore((s) => s.setShaderType);

  return (
    <div className="grid grid-cols-2 gap-2">
      {SHADER_TYPES.map((t) => {
        const Icon = ICONS[t.id];
        const active = shaderType === t.id;
        const soon = !IMPLEMENTED_SHADERS.has(t.id);
        return (
          <button
            key={t.id}
            onClick={() => setShaderType(t.id)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              active
                ? "border-flame/55 bg-flame/12 text-flame shadow-[0_8px_22px_-14px_rgba(255,90,31,0.85)]"
                : "border-white/[0.06] bg-linen/[0.025] text-linen/65 hover:border-white/[0.12] hover:bg-linen/[0.05] hover:text-linen",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.85} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{t.label}</span>
              <span className="block text-[10px] text-linen/35">
                {soon ? "Preview" : "Live"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
