import { Boxes } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { ParticleForms3DSettings, ParticleShape } from "../../types/three";
import { SliderControl } from "../controls/SliderControl";
import { SelectControl } from "../controls/SelectControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";

/* Right Properties panel for Particle Forms 3D. */

const SHAPES: { value: ParticleShape; label: string }[] = [
  { value: "sphere", label: "Sphere" },
  { value: "cube", label: "Cube" },
  { value: "torus", label: "Torus" },
  { value: "cylinder", label: "Cylinder" },
  { value: "prism", label: "Prism" },
];

type Key = keyof ParticleForms3DSettings;
type Slider = { key: Key; label: string; min: number; max: number; step?: number; unit?: string };

const GROUPS: { title: string; sliders: Slider[] }[] = [
  {
    title: "Particles",
    sliders: [
      { key: "particleCount", label: "Particle Count", min: 500, max: 30000, step: 100 },
      { key: "particleSize", label: "Particle Size", min: 0, max: 100, unit: "%" },
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
      { key: "flowStrength", label: "Flow Strength", min: 0, max: 100, unit: "%" },
      { key: "drift", label: "Drift", min: 0, max: 100, unit: "%" },
      { key: "loopDuration", label: "Loop Duration", min: 1, max: 20, step: 0.5, unit: "s" },
    ],
  },
  {
    title: "Form / Depth",
    sliders: [
      { key: "shapeScale", label: "Shape Scale", min: 0, max: 100, unit: "%" },
      { key: "depth", label: "Depth", min: 0, max: 100, unit: "%" },
      { key: "perspective", label: "Perspective", min: 0, max: 100, unit: "%" },
      { key: "thickness", label: "Thickness", min: 0, max: 100, unit: "%" },
      { key: "surfaceSpread", label: "Surface Spread", min: 0, max: 100, unit: "%" },
    ],
  },
  {
    title: "Rotation",
    sliders: [
      { key: "rotateX", label: "Rotate X", min: 0, max: 360, step: 1, unit: "°" },
      { key: "rotateY", label: "Rotate Y", min: 0, max: 360, step: 1, unit: "°" },
      { key: "rotateZ", label: "Rotate Z", min: 0, max: 360, step: 1, unit: "°" },
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

export function ThreePropertiesPanel() {
  const s = useAppStore((st) => st.particleForms3D);
  const update = useAppStore((st) => st.updateParticleForms3D);
  const fmt = (v: number, unit?: string, step?: number) =>
    `${step && step < 1 ? v.toFixed(2) : Math.round(v)}${unit ?? ""}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-flame/30 bg-flame/10 text-flame">
          <Boxes className="size-4" strokeWidth={1.8} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-linen">
            Particle Forms 3D
          </span>
          <span className="text-[10px] uppercase tracking-wide text-linen/40">
            3D Object
          </span>
        </span>
      </div>

      {/* Shape */}
      <div className="flex flex-col gap-2.5">
        <GroupLabel>Shape</GroupLabel>
        <SelectControl
          label="Shape"
          value={s.shape}
          options={SHAPES}
          onChange={(v) => update({ shape: v as ParticleShape })}
        />
      </div>

      {/* Slider groups */}
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
              onChange={(v) => update({ [f.key]: v } as Partial<ParticleForms3DSettings>)}
              format={(v) => fmt(v, f.unit, f.step)}
            />
          ))}
          {g.title === "Rotation" && (
            <Toggle
              label="Auto Rotate"
              checked={s.autoRotate}
              onChange={(v) => update({ autoRotate: v })}
            />
          )}
        </div>
      ))}

      {/* Colors */}
      <div className="flex flex-col gap-3">
        <GroupLabel>Colors</GroupLabel>
        <ColorField label="Color A" value={s.colorA} onChange={(v) => update({ colorA: v })} />
        <ColorField label="Color B" value={s.colorB} onChange={(v) => update({ colorB: v })} />
        <SliderControl
          label="Gradient Mix"
          value={s.gradientMix}
          min={0}
          max={100}
          step={1}
          onChange={(v) => update({ gradientMix: v })}
          format={(v) => `${Math.round(v)}%`}
        />
        <ColorField
          label="Background"
          value={s.background}
          onChange={(v) => update({ background: v })}
        />
      </div>
    </div>
  );
}
