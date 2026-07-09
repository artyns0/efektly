import { useAppStore } from "../../store/useAppStore";
import { Section } from "../controls/Section";
import { SliderControl } from "../controls/SliderControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";
import { ShaderTypeSelector } from "../panels/shaders/ShaderTypeSelector";
import { ShaderPresets } from "../panels/shaders/ShaderPresets";
import { ShaderParameters } from "../panels/shaders/ShaderParameters";
import { ResetButton } from "../controls/ResetButton";

/* ------------------------------------------------------------------ */
/*  Shader controls body (no input-source toggle — that lives in the   */
/*  playground toolbar). Shown in the left panel when in Shader mode.  */
/* ------------------------------------------------------------------ */

export function ShaderControls() {
  const type = useAppStore((s) => s.shaderType);
  const settings = useAppStore((s) => s.shaderSettings[type]);
  const updateShaderSettings = useAppStore((s) => s.updateShaderSettings);
  const resetShader = useAppStore((s) => s.resetShader);
  const anim = useAppStore((s) => s.shaderAnimation);
  const setAnim = useAppStore((s) => s.setShaderAnimation);

  const setColor = (patch: {
    colorA?: string;
    colorB?: string;
    background?: string;
  }) => updateShaderSettings(type, patch);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
          Shader
        </span>
        <ResetButton onClick={() => resetShader(type)} />
      </div>

      <Section title="Shader Type">
        <ShaderTypeSelector />
      </Section>

      <Section title="Presets">
        <ShaderPresets />
      </Section>

      <Section title="Parameters">
        <ShaderParameters />
      </Section>

      <Section title="Animation">
        <div className="flex flex-col gap-5">
          <Toggle
            label="Animate"
            description="Run the shader in real time"
            checked={anim.animate}
            onChange={(v) => setAnim({ animate: v })}
          />
          <SliderControl
            label="Speed"
            value={anim.speed}
            min={0}
            max={3}
            step={0.05}
            onChange={(v) => setAnim({ speed: v })}
            format={(v) => `${v.toFixed(2)}x`}
          />
          <Toggle
            label="Loop"
            checked={anim.loop}
            onChange={(v) => setAnim({ loop: v })}
          />
        </div>
      </Section>

      <Section title="Colors">
        <div className="flex flex-col gap-3">
          <ColorField
            label="Color A"
            value={settings.colorA}
            onChange={(v) => setColor({ colorA: v })}
          />
          <ColorField
            label="Color B"
            value={settings.colorB}
            onChange={(v) => setColor({ colorB: v })}
          />
          <ColorField
            label="Background"
            value={settings.background}
            onChange={(v) => setColor({ background: v })}
          />
        </div>
      </Section>
    </div>
  );
}
