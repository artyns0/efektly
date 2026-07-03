import { useAppStore } from "../../../store/useAppStore";
import type { EffectInstance, GlitchSettings } from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Toggle } from "../../controls/Toggle";

type GlitchEffect = Extract<EffectInstance, { type: "glitch" }>;

const PRESETS = [
  { value: "vhs", label: "VHS" },
  { value: "digital", label: "Digital" },
  { value: "rgb-split", label: "RGB Split" },
  { value: "signal-break", label: "Signal Break" },
];

/** Each preset tunes the glitch character. */
const PRESET_DEFAULTS: Record<
  GlitchSettings["preset"],
  Partial<GlitchSettings>
> = {
  vhs: { rgbShift: 25, scanlines: 45, distortion: 14, noise: 15, glitches: 18, grain: 15, animation: true },
  digital: { rgbShift: 18, scanlines: 10, distortion: 8, noise: 20, glitches: 55, grain: 10, animation: true },
  "rgb-split": { rgbShift: 70, scanlines: 8, distortion: 4, noise: 6, glitches: 8, grain: 6, animation: false },
  "signal-break": { rgbShift: 40, scanlines: 30, distortion: 45, noise: 55, glitches: 70, grain: 30, animation: true },
};

export function GlitchControls({ effect }: { effect: GlitchEffect }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const g = effect.settings;
  const set = (patch: Partial<GlitchSettings>) => update(effect.id, patch);

  const pct = (v: number) => `${v}%`;

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={g.preset}
        options={PRESETS}
        onChange={(v) => {
          const preset = v as GlitchSettings["preset"];
          set({ preset, ...PRESET_DEFAULTS[preset] });
        }}
      />
      <SliderControl
        label="RGB Shift"
        value={g.rgbShift}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ rgbShift: v })}
        format={pct}
      />
      <SliderControl
        label="Scanlines"
        value={g.scanlines}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ scanlines: v })}
        format={pct}
      />
      <SliderControl
        label="Distortion"
        value={g.distortion}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ distortion: v })}
        format={pct}
      />
      <SliderControl
        label="Noise"
        value={g.noise}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ noise: v })}
        format={pct}
      />
      <SliderControl
        label="Glitches"
        value={g.glitches}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ glitches: v })}
        format={pct}
      />
      <SliderControl
        label="Grain"
        value={g.grain}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ grain: v })}
        format={pct}
      />

      <Toggle
        label="Animation"
        description="Animate the glitch over time"
        checked={g.animation}
        onChange={(v) => set({ animation: v })}
      />
    </div>
  );
}
