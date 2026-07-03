import { useAppStore } from "../../../store/useAppStore";
import type {
  ColorMode,
  EchoDirection,
  EffectInstance,
  VerticalEchoSettings,
} from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { SegmentedControl } from "../../controls/SegmentedControl";
import { Toggle } from "../../controls/Toggle";
import { ColorField } from "../../controls/ColorField";

type VerticalEchoEffect = Extract<EffectInstance, { type: "verticalEcho" }>;

const PRESETS = [
  { value: "clean-echo", label: "Clean Echo" },
  { value: "long-streak", label: "Long Streak" },
  { value: "ghost-fade", label: "Ghost Fade" },
  { value: "high-contrast", label: "High Contrast" },
  { value: "soft-scan", label: "Soft Scan" },
];

const DIRECTIONS = [
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
  { value: "both", label: "Both" },
];

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "mono", label: "Mono" },
  { value: "brand", label: "Brand" },
];

/** Each preset shapes the streak character; colors follow Color Mode. */
const PRESET_DEFAULTS: Record<
  VerticalEchoSettings["preset"],
  Partial<VerticalEchoSettings>
> = {
  "clean-echo": { direction: "down", echoLength: 35, repeatCount: 10, opacityFade: 70, stretchAmount: 12, blur: 8, threshold: 20, contrast: 15, noise: 5, offsetJitter: 0, backgroundFade: 0 },
  "long-streak": { direction: "down", echoLength: 70, repeatCount: 20, opacityFade: 50, stretchAmount: 30, blur: 5, threshold: 30, contrast: 25, noise: 6, offsetJitter: 0, backgroundFade: 0 },
  "ghost-fade": { direction: "both", echoLength: 40, repeatCount: 14, opacityFade: 85, stretchAmount: 15, blur: 22, threshold: 12, contrast: 6, noise: 4, offsetJitter: 6, backgroundFade: 20 },
  "high-contrast": { direction: "down", echoLength: 40, repeatCount: 10, opacityFade: 60, stretchAmount: 10, blur: 4, threshold: 45, contrast: 60, noise: 8, offsetJitter: 0, backgroundFade: 0 },
  "soft-scan": { direction: "both", echoLength: 25, repeatCount: 12, opacityFade: 75, stretchAmount: 18, blur: 16, threshold: 15, contrast: 8, noise: 5, offsetJitter: 4, backgroundFade: 10 },
};

export function VerticalEchoControls({
  effect,
}: {
  effect: VerticalEchoEffect;
}) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const e = effect.settings;
  const set = (patch: Partial<VerticalEchoSettings>) => update(effect.id, patch);
  const pct = (v: number) => `${Math.round(v)}%`;

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={e.preset}
        options={PRESETS}
        onChange={(v) => {
          const preset = v as VerticalEchoSettings["preset"];
          set({ preset, ...PRESET_DEFAULTS[preset] });
        }}
      />

      <SelectControl
        label="Direction"
        value={e.direction}
        options={DIRECTIONS}
        onChange={(v) => set({ direction: v as EchoDirection })}
      />

      <SliderControl label="Echo Length" value={e.echoLength} min={0} max={100} step={1} onChange={(v) => set({ echoLength: v })} format={pct} />
      <SliderControl label="Repeat Count" value={e.repeatCount} min={1} max={40} step={1} onChange={(v) => set({ repeatCount: v })} format={(v) => `${v}`} />
      <SliderControl label="Opacity Fade" value={e.opacityFade} min={0} max={100} step={1} onChange={(v) => set({ opacityFade: v })} format={pct} />
      <SliderControl label="Stretch Amount" value={e.stretchAmount} min={0} max={100} step={1} onChange={(v) => set({ stretchAmount: v })} format={pct} />
      <SliderControl label="Blur" value={e.blur} min={0} max={100} step={1} onChange={(v) => set({ blur: v })} format={pct} />
      <SliderControl label="Threshold" value={e.threshold} min={0} max={100} step={1} onChange={(v) => set({ threshold: v })} format={pct} />
      <SliderControl label="Contrast" value={e.contrast} min={-100} max={100} step={1} onChange={(v) => set({ contrast: v })} format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
      <SliderControl label="Noise" value={e.noise} min={0} max={100} step={1} onChange={(v) => set({ noise: v })} format={pct} />
      <SliderControl label="Offset Jitter" value={e.offsetJitter} min={0} max={100} step={1} onChange={(v) => set({ offsetJitter: v })} format={pct} />
      <SliderControl label="Background Fade" value={e.backgroundFade} min={0} max={100} step={1} onChange={(v) => set({ backgroundFade: v })} format={pct} />

      <Toggle label="Invert" checked={e.invert} onChange={(v) => set({ invert: v })} />

      <div className="flex flex-col gap-2.5">
        <span className="text-sm text-linen/70">Color Mode</span>
        <SegmentedControl
          size="sm"
          value={e.colorMode}
          onChange={(v) => set({ colorMode: v })}
          segments={COLOR_MODES}
        />
      </div>

      <div className="flex flex-col gap-3">
        <ColorField
          label="Foreground"
          value={e.fgColor}
          disabled={e.colorMode === "original"}
          onChange={(v) => set({ fgColor: v })}
        />
        <ColorField
          label="Background"
          value={e.bgColor}
          disabled={e.colorMode === "original"}
          onChange={(v) => set({ bgColor: v })}
        />
        <ColorField
          label="Accent"
          value={e.accentColor}
          onChange={(v) => set({ accentColor: v })}
        />
      </div>
    </div>
  );
}
