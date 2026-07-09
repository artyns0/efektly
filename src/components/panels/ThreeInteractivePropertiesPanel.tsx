import { MousePointer2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type {
  InteractiveColorMode,
  InteractiveParticles3DSettings,
  InteractiveShape,
  MouseMode,
} from "../../types/three";
import { INTERACTIVE_PARTICLE_PRESETS } from "../../data/three";
import { SliderControl } from "../controls/SliderControl";
import { SelectControl } from "../controls/SelectControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";
import { ResetButton } from "../controls/ResetButton";

/* Right Properties panel for Particle Form 3D (mouse-interactive). */

type Key = keyof InteractiveParticles3DSettings;
type Slider = { key: Key; label: string; min: number; max: number; step?: number; unit?: string };

const SHAPES = [
  { value: "sphere", label: "Dot Sphere" },
  { value: "shell", label: "Shell" },
  { value: "blob", label: "Blob" },
  { value: "cloud", label: "Cloud" },
  { value: "field", label: "Flow Field" },
];
const MODES = [
  { value: "repel", label: "Repel" },
  { value: "attract", label: "Attract" },
  { value: "disturb", label: "Disturb" },
];
const COLOR_MODES = [
  { value: "gradient", label: "Gradient" },
  { value: "solid", label: "Solid" },
  { value: "chromatic", label: "Chromatic" },
];
const PRESETS = Object.keys(INTERACTIVE_PARTICLE_PRESETS).map((n) => ({ value: n, label: n }));

const GROUPS: { title: string; sliders: Slider[] }[] = [
  {
    title: "Particles",
    sliders: [
      { key: "particleCount", label: "Particle Count", min: 1000, max: 24000, step: 100 },
      { key: "pointSize", label: "Point Size", min: 0, max: 100, unit: "%" },
      { key: "opacity", label: "Opacity", min: 0, max: 100, unit: "%" },
      { key: "glow", label: "Glow", min: 0, max: 100, unit: "%" },
      { key: "softness", label: "Softness", min: 0, max: 100, unit: "%" },
    ],
  },
  {
    title: "Motion",
    sliders: [
      { key: "speed", label: "Speed", min: 0, max: 3, step: 0.05, unit: "x" },
      { key: "turbulence", label: "Turbulence", min: 0, max: 100, unit: "%" },
      { key: "noiseAmount", label: "Noise Amount", min: 0, max: 100, unit: "%" },
      { key: "morph", label: "Morph", min: 0, max: 100, unit: "%" },
      { key: "loopSpeed", label: "Loop Speed", min: 0, max: 3, step: 0.05, unit: "x" },
    ],
  },
  {
    title: "Interaction",
    sliders: [
      { key: "interactionRadius", label: "Interaction Radius", min: 0, max: 100, unit: "%" },
      { key: "interactionStrength", label: "Interaction Strength", min: 0, max: 100, unit: "%" },
      { key: "smoothing", label: "Smoothing", min: 0, max: 100, unit: "%" },
    ],
  },
];

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-linen/45">
      {children}
    </span>
  );
}

export function ThreeInteractivePropertiesPanel() {
  const s = useAppStore((st) => st.interactiveParticles3D);
  const update = useAppStore((st) => st.updateInteractiveParticles3D);
  const applyPreset = useAppStore((st) => st.applyInteractiveParticlePreset);
  const reset = useAppStore((st) => st.resetThreeTool);
  const fmt = (v: number, unit?: string, step?: number) =>
    `${step && step < 1 ? v.toFixed(2) : Math.round(v)}${unit ?? ""}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-flame/30 bg-flame/10 text-flame">
          <MousePointer2 className="size-4" strokeWidth={1.8} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-linen">Particle Form 3D</span>
          <span className="text-[10px] uppercase tracking-wide text-linen/40">Interactive · move the mouse</span>
        </span>
        <ResetButton onClick={reset} />
      </div>

      <div className="flex flex-col gap-2.5">
        <GroupLabel>Preset</GroupLabel>
        <SelectControl label="Preset" value={s.preset} options={PRESETS} onChange={applyPreset} />
        <SelectControl
          label="Shape"
          value={s.shape}
          options={SHAPES}
          onChange={(v) => update({ shape: v as InteractiveShape })}
        />
      </div>

      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-4">
          <GroupLabel>{g.title}</GroupLabel>
          {g.sliders.map((f) => (
            <SliderControl
              key={f.key}
              label={f.label}
              value={s[f.key] as number}
              min={f.min}
              max={f.max}
              step={f.step ?? 1}
              onChange={(v) => update({ [f.key]: v } as Partial<InteractiveParticles3DSettings>)}
              format={(v) => fmt(v, f.unit, f.step)}
            />
          ))}
          {g.title === "Interaction" && (
            <SelectControl
              label="Mouse Mode"
              value={s.mouseMode}
              options={MODES}
              onChange={(v) => update({ mouseMode: v as MouseMode })}
            />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <GroupLabel>Color</GroupLabel>
        <SelectControl
          label="Color Mode"
          value={s.colorMode}
          options={COLOR_MODES}
          onChange={(v) => update({ colorMode: v as InteractiveColorMode })}
        />
        <ColorField label="Primary Color" value={s.colorA} onChange={(v) => update({ colorA: v })} />
        <ColorField label="Secondary Color" value={s.colorB} onChange={(v) => update({ colorB: v })} />
        <ColorField label="Background" value={s.background} onChange={(v) => update({ background: v })} />
        <Toggle label="Auto Rotate" checked={s.autoRotate} onChange={(v) => update({ autoRotate: v })} />
      </div>
    </div>
  );
}
