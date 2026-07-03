import { useAppStore } from "../../../store/useAppStore";
import type { AsciiSettings, ColorMode, EffectInstance } from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { SegmentedControl } from "../../controls/SegmentedControl";
import { Toggle } from "../../controls/Toggle";
import { ColorField } from "../../controls/ColorField";

type AsciiEffect = Extract<EffectInstance, { type: "ascii" }>;

const PRESETS = [
  { value: "standard", label: "Standard" },
  { value: "dense", label: "Dense" },
  { value: "minimal", label: "Minimal" },
  { value: "blocks", label: "Blocks" },
];

const CHAR_SETS = [
  { value: "standard", label: "Standard" },
  { value: "dense", label: "Dense" },
  { value: "minimal", label: "Minimal" },
  { value: "blocks", label: "Blocks" },
];

/** A preset picks a character ramp and a sensible cell size. */
const PRESET_DEFAULTS: Record<
  AsciiSettings["preset"],
  { charSet: AsciiSettings["charSet"]; cellSize: number }
> = {
  standard: { charSet: "standard", cellSize: 10 },
  dense: { charSet: "dense", cellSize: 6 },
  minimal: { charSet: "minimal", cellSize: 12 },
  blocks: { charSet: "blocks", cellSize: 10 },
};

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "mono", label: "Mono" },
  { value: "original", label: "Original" },
  { value: "brand", label: "Brand" },
];

export function AsciiControls({ effect }: { effect: AsciiEffect }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const a = effect.settings;
  const set = (patch: Partial<AsciiSettings>) => update(effect.id, patch);

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={a.preset}
        options={PRESETS}
        onChange={(v) => {
          const preset = v as AsciiSettings["preset"];
          set({ preset, ...PRESET_DEFAULTS[preset] });
        }}
      />
      <SliderControl
        label="Cell Size"
        value={a.cellSize}
        min={4}
        max={24}
        step={1}
        onChange={(v) => set({ cellSize: v })}
        format={(v) => `${v}px`}
      />
      <SelectControl
        label="Character Set"
        value={a.charSet}
        options={CHAR_SETS}
        onChange={(v) => set({ charSet: v as AsciiSettings["charSet"] })}
      />

      <Toggle
        label="Invert"
        checked={a.invert}
        onChange={(v) => set({ invert: v })}
      />

      <div className="flex flex-col gap-2.5">
        <span className="text-sm text-linen/70">Color Mode</span>
        <SegmentedControl
          size="sm"
          value={a.colorMode}
          onChange={(v) => set({ colorMode: v })}
          segments={COLOR_MODES}
        />
      </div>

      <Toggle
        label="Character Rotation"
        checked={a.rotation}
        onChange={(v) => set({ rotation: v })}
      />

      <div className="flex flex-col gap-3">
        <ColorField
          label="Foreground"
          value={a.fgColor}
          disabled={a.colorMode !== "mono"}
          onChange={(v) => set({ fgColor: v })}
        />
        <ColorField
          label="Background"
          value={a.bgColor}
          disabled={a.colorMode === "brand"}
          onChange={(v) => set({ bgColor: v })}
        />
      </div>
    </div>
  );
}
