import { cn } from "../../../lib/cn";
import { useAppStore } from "../../../store/useAppStore";
import { SHADER_PRESETS } from "../../../data/shaders";

export function ShaderPresets() {
  const shaderType = useAppStore((s) => s.shaderType);
  const presetByType = useAppStore((s) => s.shaderPresetByType);
  const applyPreset = useAppStore((s) => s.applyShaderPreset);

  const presets = SHADER_PRESETS[shaderType];
  const active = presetByType[shaderType];

  return (
    <div className="grid grid-cols-2 gap-2">
      {presets.map((p) => {
        const isActive = p.name === active;
        return (
          <button
            key={p.name}
            onClick={() => applyPreset(shaderType, p.name)}
            aria-pressed={isActive}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              isActive
                ? "border-flame/50 bg-flame/10 text-flame"
                : "border-white/[0.06] bg-white/[0.02] text-linen/65 hover:border-white/[0.12] hover:text-linen",
            )}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
