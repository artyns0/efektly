import { useAppStore } from "../../../store/useAppStore";
import type { EffectInstance, LineArtSettings } from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Toggle } from "../../controls/Toggle";
import { ColorField } from "../../controls/ColorField";

type LineArtEffect = Extract<EffectInstance, { type: "lineArt" }>;

const PRESETS = [
  { value: "clean", label: "Clean" },
  { value: "sketch", label: "Sketch" },
  { value: "ink", label: "Ink" },
  { value: "technical", label: "Technical" },
];

/** Each preset tunes the edge character; colors are left to the user. */
const PRESET_DEFAULTS: Record<
  LineArtSettings["preset"],
  Partial<LineArtSettings>
> = {
  clean: { threshold: 45, thickness: 2, softness: 12, fill: 0, lineWeight: 1.2, wave: 0, waveFrequency: 6 },
  sketch: { threshold: 38, thickness: 2, softness: 30, fill: 12, lineWeight: 1.2, wave: 32, waveFrequency: 9 },
  ink: { threshold: 42, thickness: 3, softness: 6, fill: 28, lineWeight: 2.6, wave: 0, waveFrequency: 5 },
  technical: { threshold: 55, thickness: 1, softness: 2, fill: 0, lineWeight: 1, wave: 0, waveFrequency: 4 },
};

export function LineArtControls({ effect }: { effect: LineArtEffect }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const l = effect.settings;
  const set = (patch: Partial<LineArtSettings>) => update(effect.id, patch);

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={l.preset}
        options={PRESETS}
        onChange={(v) => {
          const preset = v as LineArtSettings["preset"];
          set({ preset, ...PRESET_DEFAULTS[preset] });
        }}
      />
      <SliderControl
        label="Threshold"
        value={l.threshold}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ threshold: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Thickness"
        value={l.thickness}
        min={1}
        max={10}
        step={0.5}
        onChange={(v) => set({ thickness: v })}
        format={(v) => `${v}px`}
      />
      <SliderControl
        label="Softness"
        value={l.softness}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ softness: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Fill"
        value={l.fill}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ fill: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Line Weight"
        value={l.lineWeight}
        min={0.5}
        max={6}
        step={0.5}
        onChange={(v) => set({ lineWeight: v })}
        format={(v) => `${v}`}
      />
      <SliderControl
        label="Wave"
        value={l.wave}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ wave: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Wave Frequency"
        value={l.waveFrequency}
        min={1}
        max={30}
        step={1}
        onChange={(v) => set({ waveFrequency: v })}
        format={(v) => `${v}`}
      />

      <Toggle
        label="Invert"
        checked={l.invert}
        onChange={(v) => set({ invert: v })}
      />

      <div className="flex flex-col gap-3">
        <ColorField
          label="Line"
          value={l.lineColor}
          onChange={(v) => set({ lineColor: v })}
        />
        <ColorField
          label="Fill"
          value={l.fillColor}
          onChange={(v) => set({ fillColor: v })}
        />
        <ColorField
          label="Background"
          value={l.bgColor}
          onChange={(v) => set({ bgColor: v })}
        />
      </div>
    </div>
  );
}
