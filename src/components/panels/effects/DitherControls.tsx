import { Plus, X } from "lucide-react";
import { cn } from "../../../lib/cn";
import { useAppStore } from "../../../store/useAppStore";
import type { DitherSettings, EffectInstance } from "../../../types/effects";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Toggle } from "../../controls/Toggle";
import { ColorField } from "../../controls/ColorField";

type DitherEffect = Extract<EffectInstance, { type: "dither" }>;

const PRESETS = [
  { value: "floyd-steinberg", label: "Floyd–Steinberg" },
  { value: "ordered", label: "Ordered" },
  { value: "bayer", label: "Bayer" },
  { value: "atkinson", label: "Atkinson" },
];

const EXTRA_COLORS = ["#FF5A1F", "#E7C9A9", "#E09B6B", "#4A443E"];

export function DitherControls({ effect }: { effect: DitherEffect }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const d = effect.settings;
  const set = (patch: Partial<DitherSettings>) => update(effect.id, patch);

  const setColor = (i: number, value: string) => {
    const palette = d.palette.map((c, idx) => (idx === i ? value : c));
    set({ palette });
  };
  const addColor = () => {
    const next = EXTRA_COLORS[d.palette.length % EXTRA_COLORS.length];
    set({ palette: [...d.palette, next] });
  };
  const removeColor = (i: number) => {
    if (d.palette.length <= 2) return; // keep at least Color 1 & 2
    set({ palette: d.palette.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        label="Preset"
        value={d.preset}
        options={PRESETS}
        onChange={(v) => set({ preset: v as DitherSettings["preset"] })}
      />
      <SliderControl
        label="Point Size"
        value={d.pointSize}
        min={1}
        max={12}
        step={1}
        onChange={(v) => set({ pointSize: v })}
        format={(v) => `${v}px`}
      />
      <SliderControl
        label="Threshold"
        value={d.threshold}
        min={0}
        max={100}
        step={1}
        onChange={(v) => set({ threshold: v })}
        format={(v) => `${v}%`}
      />
      <SliderControl
        label="Contrast"
        value={d.contrast}
        min={-100}
        max={100}
        step={1}
        onChange={(v) => set({ contrast: v })}
        format={(v) => (v > 0 ? `+${v}` : `${v}`)}
      />

      <SelectControl
        label="Colors"
        value={d.colorMode ?? "custom"}
        options={[
          { value: "original", label: "Original colors" },
          { value: "custom", label: "Custom palette" },
        ]}
        onChange={(v) => set({ colorMode: v as DitherSettings["colorMode"] })}
      />

      {(d.colorMode ?? "custom") === "custom" && (
      <div className="flex flex-col gap-3">
        <span className="text-sm text-linen/70">Color Palette</span>
        {d.palette.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">
              <ColorField
                label={`Color ${i + 1}`}
                value={color}
                onChange={(v) => setColor(i, v)}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove color ${i + 1}`}
              disabled={d.palette.length <= 2}
              onClick={() => removeColor(i)}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-lg text-linen/40 transition-colors",
                "hover:bg-linen/[0.06] hover:text-linen disabled:opacity-25 disabled:hover:bg-transparent",
              )}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addColor}
          className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-sm text-linen/55",
            "transition-colors hover:border-flame/50 hover:text-flame",
          )}
        >
          <Plus className="size-4" strokeWidth={2} />
          Add Color
        </button>
      </div>
      )}

      <Toggle
        label="Invert"
        checked={d.invert}
        onChange={(v) => set({ invert: v })}
      />
      <Toggle
        label="Bloom"
        description="Glow bright dither pixels"
        checked={d.bloom}
        onChange={(v) => set({ bloom: v })}
      />
      {d.bloom && (
        <>
          <SliderControl
            label="Bloom Intensity"
            value={d.bloomIntensity}
            min={0}
            max={100}
            step={1}
            onChange={(v) => set({ bloomIntensity: v })}
            format={(v) => `${v}%`}
          />
          <SliderControl
            label="Bloom Radius"
            value={d.bloomRadius}
            min={1}
            max={30}
            step={1}
            onChange={(v) => set({ bloomRadius: v })}
            format={(v) => `${v}px`}
          />
          <SliderControl
            label="Bloom Threshold"
            value={d.bloomThreshold}
            min={0}
            max={100}
            step={1}
            onChange={(v) => set({ bloomThreshold: v })}
            format={(v) => `${v}%`}
          />
        </>
      )}
    </div>
  );
}
