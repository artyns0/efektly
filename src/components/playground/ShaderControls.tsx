import { useAppStore } from "../../store/useAppStore";
import type { MotionStyle } from "../../types/shaders";
import { Section } from "../controls/Section";
import { SliderControl } from "../controls/SliderControl";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";
import { ShaderTypeSelector } from "../panels/shaders/ShaderTypeSelector";
import { ShaderPresets } from "../panels/shaders/ShaderPresets";
import { ShaderParameters } from "../panels/shaders/ShaderParameters";

/* ------------------------------------------------------------------ */
/*  Shader controls body (no input-source toggle — that lives in the   */
/*  playground toolbar). Shown in the left panel when in Shader mode.  */
/* ------------------------------------------------------------------ */

const MOTION_STYLES: { value: MotionStyle; label: string }[] = [
  { value: "drift", label: "Drift" },
  { value: "pulse", label: "Pulse" },
  { value: "wave", label: "Wave" },
  { value: "chaos", label: "Chaos" },
];

export function ShaderControls() {
  const type = useAppStore((s) => s.shaderType);
  const settings = useAppStore((s) => s.shaderSettings[type]);
  const updateShaderSettings = useAppStore((s) => s.updateShaderSettings);
  const anim = useAppStore((s) => s.shaderAnimation);
  const setAnim = useAppStore((s) => s.setShaderAnimation);

  const setColor = (patch: {
    colorA?: string;
    colorB?: string;
    background?: string;
  }) => updateShaderSettings(type, patch);

  return (
    <div className="flex flex-col gap-3">
      <span className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
        Shader
      </span>

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
          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-linen/70">Motion Style</span>
            <SegmentedControl
              size="sm"
              value={anim.motionStyle}
              onChange={(v) => setAnim({ motionStyle: v })}
              segments={MOTION_STYLES}
            />
          </div>
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
