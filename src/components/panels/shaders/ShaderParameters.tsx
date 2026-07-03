import { useAppStore } from "../../../store/useAppStore";
import type { ShaderColorMode, ShaderSettingsPatch } from "../../../types/shaders";
import { SliderControl } from "../../controls/SliderControl";
import { SegmentedControl } from "../../controls/SegmentedControl";

const COLOR_MODES: { value: ShaderColorMode; label: string }[] = [
  { value: "brand", label: "Brand" },
  { value: "mono", label: "Mono" },
  { value: "duo", label: "Duo" },
];

/**
 * Parameter controls for the selected shader. The visible set changes per
 * shader type; every change writes to that shader's settings in the store.
 */
export function ShaderParameters() {
  const type = useAppStore((s) => s.shaderType);
  const settings = useAppStore((s) => s.shaderSettings);
  const update = useAppStore((s) => s.updateShaderSettings);
  const set = (patch: ShaderSettingsPatch) => update(type, patch);

  const pct = (v: number) => `${Math.round(v)}%`;
  const speedSlider = (value: number) => (
    <SliderControl
      label="Speed"
      value={value}
      min={0}
      max={3}
      step={0.05}
      onChange={(v) => set({ speed: v })}
      format={(v) => `${v.toFixed(2)}x`}
    />
  );

  if (type === "dotGrid") {
    const s = settings.dotGrid;
    return (
      <div className="flex flex-col gap-5">
        <SliderControl label="Dot Size" value={s.dotSize} min={0.1} max={1} step={0.02} onChange={(v) => set({ dotSize: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <SliderControl label="Spacing" value={s.spacing} min={10} max={60} step={1} onChange={(v) => set({ spacing: v })} format={(v) => `${v}px`} />
        <SliderControl label="Pulse" value={s.pulse} min={0} max={100} step={1} onChange={(v) => set({ pulse: v })} format={pct} />
        <SliderControl label="Drift" value={s.drift} min={0} max={100} step={1} onChange={(v) => set({ drift: v })} format={pct} />
        {speedSlider(s.speed)}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm text-linen/70">Color Mode</span>
          <SegmentedControl size="sm" value={s.colorMode} onChange={(v) => set({ colorMode: v })} segments={COLOR_MODES} />
        </div>
      </div>
    );
  }

  if (type === "meshLiquid") {
    const s = settings.meshLiquid;
    return (
      <div className="flex flex-col gap-5">
        <SliderControl label="Scale" value={s.scale} min={0} max={100} step={1} onChange={(v) => set({ scale: v })} format={pct} />
        <SliderControl label="Distortion" value={s.distortion} min={0} max={100} step={1} onChange={(v) => set({ distortion: v })} format={pct} />
        <SliderControl label="Flow" value={s.flow} min={0} max={100} step={1} onChange={(v) => set({ flow: v })} format={pct} />
        <SliderControl label="Highlights" value={s.highlights} min={0} max={100} step={1} onChange={(v) => set({ highlights: v })} format={pct} />
        <SliderControl label="Smoothness" value={s.smoothness} min={0} max={100} step={1} onChange={(v) => set({ smoothness: v })} format={pct} />
        {speedSlider(s.speed)}
      </div>
    );
  }

  if (type === "voronoi") {
    const s = settings.voronoi;
    return (
      <div className="flex flex-col gap-5">
        <SliderControl label="Cell Count" value={s.cellCount} min={4} max={80} step={1} onChange={(v) => set({ cellCount: v })} format={(v) => `${v}`} />
        <SliderControl label="Border Width" value={s.borderWidth} min={0} max={100} step={1} onChange={(v) => set({ borderWidth: v })} format={pct} />
        <SliderControl label="Distortion" value={s.distortion} min={0} max={100} step={1} onChange={(v) => set({ distortion: v })} format={pct} />
        <SliderControl label="Rotation" value={s.rotation} min={0} max={360} step={1} onChange={(v) => set({ rotation: v })} format={(v) => `${v}°`} />
        {speedSlider(s.speed)}
      </div>
    );
  }

  // particles
  const s = settings.particles;
  return (
    <div className="flex flex-col gap-5">
      <SliderControl label="Count" value={s.count} min={20} max={400} step={5} onChange={(v) => set({ count: v })} format={(v) => `${v}`} />
      <SliderControl label="Size" value={s.size} min={0} max={100} step={1} onChange={(v) => set({ size: v })} format={pct} />
      <SliderControl label="Spread" value={s.spread} min={0} max={100} step={1} onChange={(v) => set({ spread: v })} format={pct} />
      <SliderControl label="Glow" value={s.glow} min={0} max={100} step={1} onChange={(v) => set({ glow: v })} format={pct} />
      {speedSlider(s.speed)}
    </div>
  );
}
