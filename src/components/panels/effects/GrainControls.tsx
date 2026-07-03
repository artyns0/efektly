import { useAppStore } from "../../../store/useAppStore";
import type { EffectInstance, GrainSettings } from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Toggle } from "../../controls/Toggle";

type GrainEffect = Extract<EffectInstance, { type: "grain" }>;

const BLEND_MODES = [
  { value: "normal", label: "Normal" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft Light" },
  { value: "screen", label: "Screen" },
];

export function GrainControls({ effect }: { effect: GrainEffect }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const g = effect.settings;
  const set = (patch: Partial<GrainSettings>) => update(effect.id, patch);

  return (
    <div className="flex flex-col gap-5">
      <SliderControl
        label="Amount"
        value={g.amount}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ amount: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Size"
        value={g.size}
        min={0.5}
        max={4}
        step={0.1}
        onChange={(v) => set({ size: v })}
        format={(v) => `${v.toFixed(1)}px`}
      />
      <SliderControl
        label="Speed"
        value={g.speed}
        min={0}
        max={3}
        step={0.1}
        onChange={(v) => set({ speed: v })}
        format={(v) => `${v.toFixed(1)}x`}
      />

      <Toggle
        label="Monochrome"
        checked={g.monochrome}
        onChange={(v) => set({ monochrome: v })}
      />

      <SelectControl
        label="Blend Mode"
        value={g.blendMode}
        options={BLEND_MODES}
        onChange={(v) => set({ blendMode: v as GrainSettings["blendMode"] })}
      />
    </div>
  );
}
