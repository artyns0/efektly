import { useAppStore } from "../../store/useAppStore";
import type { MotionStyle } from "../../types/shaders";
import { Section } from "../controls/Section";
import { SliderControl } from "../controls/SliderControl";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";
import { InputModeToggle } from "./InputModeToggle";
import { ShaderTypeSelector } from "./shaders/ShaderTypeSelector";
import { ShaderPresets } from "./shaders/ShaderPresets";
import { ShaderParameters } from "./shaders/ShaderParameters";

const MOTION_STYLES: { value: MotionStyle; label: string }[] = [
  { value: "drift", label: "Drift" },
  { value: "pulse", label: "Pulse" },
  { value: "wave", label: "Wave" },
  { value: "chaos", label: "Chaos" },
];

export function ShaderPanel() {
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
    <div className="flex flex-col gap-4">
      {/* 1 — Input Source */}
      <Section index={1} title="Input Source">
        <InputModeToggle />
      </Section>

      {/* 2 — Shader Type */}
      <Section index={2} title="Shader Type">
        <ShaderTypeSelector />
      </Section>

      {/* 3 — Presets */}
      <Section index={3} title="Presets">
        <ShaderPresets />
      </Section>

      {/* 4 — Parameters */}
      <Section index={4} title="Parameters">
        <ShaderParameters />
      </Section>

      {/* 5 — Animation (Shader mode only) */}
      <Section index={5} title="Animation">
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

      {/* 6 — Colors */}
      <Section index={6} title="Colors">
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
