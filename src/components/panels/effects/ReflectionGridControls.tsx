import { useAppStore } from "../../../store/useAppStore";
import type {
  ColorMode,
  EffectInstance,
  ReflectionGridSettings,
} from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { SegmentedControl } from "../../controls/SegmentedControl";
import { Toggle } from "../../controls/Toggle";

type ReflectionGridEffect = Extract<EffectInstance, { type: "reflectionGrid" }>;

const PRESETS = [
  { value: "soft-mirror", label: "Soft Mirror" },
  { value: "radial-tile", label: "Radial Tile" },
  { value: "tunnel-grid", label: "Tunnel Grid" },
  { value: "kaleido", label: "Kaleido" },
  { value: "dark-glow", label: "Dark Glow" },
];

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "brand", label: "Brand" },
  { value: "mono", label: "Mono" },
];

/** Each preset tunes the reflection character; colors follow Color Mode. */
const PRESET_DEFAULTS: Record<
  ReflectionGridSettings["preset"],
  Partial<ReflectionGridSettings>
> = {
  "soft-mirror": { repeatCount: 2, mirrorAmount: 100, rotation: 0, scale: 1, softness: 22, glow: 20, contrast: 8, colorShift: 0, noise: 6 },
  "radial-tile": { repeatCount: 4, mirrorAmount: 90, rotation: 45, scale: 1.2, softness: 8, glow: 30, contrast: 14, colorShift: 0, noise: 8 },
  "tunnel-grid": { repeatCount: 6, mirrorAmount: 100, rotation: 0, scale: 0.7, softness: 6, glow: 35, contrast: 18, colorShift: 0, noise: 10 },
  kaleido: { repeatCount: 3, mirrorAmount: 100, rotation: 30, scale: 1.4, softness: 10, glow: 40, contrast: 12, colorShift: 20, noise: 8 },
  "dark-glow": { repeatCount: 2, mirrorAmount: 100, rotation: 0, scale: 1.1, softness: 30, glow: 65, contrast: 25, colorShift: 0, noise: 14 },
};

export function ReflectionGridControls({
  effect,
}: {
  effect: ReflectionGridEffect;
}) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const r = effect.settings;
  const set = (patch: Partial<ReflectionGridSettings>) => update(effect.id, patch);
  const pct = (v: number) => `${Math.round(v)}%`;

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={r.preset}
        options={PRESETS}
        onChange={(v) => {
          const preset = v as ReflectionGridSettings["preset"];
          set({ preset, ...PRESET_DEFAULTS[preset] });
        }}
      />

      <SliderControl label="Cell Size" value={r.cellSize} min={5} max={100} step={1} onChange={(v) => set({ cellSize: v })} format={pct} />
      <SliderControl label="Repeat Count" value={r.repeatCount} min={1} max={12} step={1} onChange={(v) => set({ repeatCount: v })} format={(v) => `${v}×${v}`} />
      <SliderControl label="Mirror Amount" value={r.mirrorAmount} min={0} max={100} step={1} onChange={(v) => set({ mirrorAmount: v })} format={pct} />
      <SliderControl label="Rotation" value={r.rotation} min={0} max={360} step={1} onChange={(v) => set({ rotation: v })} format={(v) => `${v}°`} />
      <SliderControl label="Scale" value={r.scale} min={0.25} max={4} step={0.05} onChange={(v) => set({ scale: v })} format={(v) => `${v.toFixed(2)}x`} />
      <SliderControl label="Softness" value={r.softness} min={0} max={100} step={1} onChange={(v) => set({ softness: v })} format={pct} />
      <SliderControl label="Glow" value={r.glow} min={0} max={100} step={1} onChange={(v) => set({ glow: v })} format={pct} />
      <SliderControl label="Contrast" value={r.contrast} min={-100} max={100} step={1} onChange={(v) => set({ contrast: v })} format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
      <SliderControl label="Color Shift" value={r.colorShift} min={0} max={360} step={1} onChange={(v) => set({ colorShift: v })} format={(v) => `${v}°`} />
      <SliderControl label="Noise" value={r.noise} min={0} max={100} step={1} onChange={(v) => set({ noise: v })} format={pct} />
      <SliderControl label="Center X" value={r.centerX} min={0} max={1} step={0.01} onChange={(v) => set({ centerX: v })} format={(v) => v.toFixed(2)} />
      <SliderControl label="Center Y" value={r.centerY} min={0} max={1} step={0.01} onChange={(v) => set({ centerY: v })} format={(v) => v.toFixed(2)} />

      <Toggle label="Invert" checked={r.invert} onChange={(v) => set({ invert: v })} />

      <div className="flex flex-col gap-2.5">
        <span className="text-sm text-linen/70">Color Mode</span>
        <SegmentedControl
          size="sm"
          value={r.colorMode}
          onChange={(v) => set({ colorMode: v })}
          segments={COLOR_MODES}
        />
      </div>
    </div>
  );
}
