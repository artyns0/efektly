import { ImageIcon } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { ImageColorMode, ImageParticles3DSettings } from "../../types/three";
import { IMAGE_PARTICLE_PRESETS } from "../../data/three";
import { SliderControl } from "../controls/SliderControl";
import { SelectControl } from "../controls/SelectControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";
import { ResetButton } from "../controls/ResetButton";

/* Right Properties panel for Image to 3D Particles. */

type Key = keyof ImageParticles3DSettings;
type Slider = { key: Key; label: string; min: number; max: number; step?: number; unit?: string };

const COLOR_MODES = [
  { value: "original", label: "Original Colors" },
  { value: "monochrome", label: "Monochrome" },
  { value: "duotone", label: "Duotone" },
];
const PRESETS = Object.keys(IMAGE_PARTICLE_PRESETS).map((n) => ({ value: n, label: n }));

const GROUPS: { title: string; sliders: Slider[] }[] = [
  {
    title: "Reconstruction",
    sliders: [
      { key: "depthStrength", label: "Depth Strength", min: 0, max: 100, unit: "%" },
      { key: "particleDensity", label: "Particle Density", min: 0, max: 100, unit: "%" },
      { key: "pointSize", label: "Point Size", min: 0, max: 100, unit: "%" },
      { key: "brightnessInfluence", label: "Brightness Influence", min: 0, max: 100, unit: "%" },
      { key: "edgeSensitivity", label: "Edge Sensitivity", min: 0, max: 100, unit: "%" },
      { key: "zSpread", label: "Z Spread", min: 0, max: 100, unit: "%" },
      { key: "smoothness", label: "Smoothness", min: 0, max: 100, unit: "%" },
      { key: "contrastInfluence", label: "Contrast Influence", min: 0, max: 100, unit: "%" },
      { key: "threshold", label: "Threshold", min: 0, max: 100, unit: "%" },
      { key: "silhouetteStrength", label: "Silhouette Strength", min: 0, max: 100, unit: "%" },
    ],
  },
  {
    title: "Scene",
    sliders: [
      { key: "rotationSensitivity", label: "Rotation Sensitivity", min: 0, max: 100, unit: "%" },
      { key: "parallaxStrength", label: "Parallax Strength", min: 0, max: 100, unit: "%" },
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

export function ThreeImagePropertiesPanel() {
  const s = useAppStore((st) => st.imageParticles3D);
  const update = useAppStore((st) => st.updateImageParticles3D);
  const applyPreset = useAppStore((st) => st.applyImageParticlePreset);
  const reset = useAppStore((st) => st.resetThreeTool);
  const hasImage = useAppStore((st) => st.mediaImage !== null);
  const fmt = (v: number, unit?: string) => `${Math.round(v)}${unit ?? ""}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-flame/30 bg-flame/10 text-flame">
          <ImageIcon className="size-4" strokeWidth={1.8} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-linen">Image to 3D Particles</span>
          <span className="text-[10px] uppercase tracking-wide text-linen/40">3D Object · orbit to inspect</span>
        </span>
        <ResetButton onClick={reset} />
      </div>

      {!hasImage && (
        <div className="rounded-xl border border-dashed border-white/[0.12] bg-linen/[0.015] px-3 py-3 text-xs text-linen/50">
          Upload a PNG or JPEG in the <span className="text-linen/70">Source</span> tab to build a 3D particle reconstruction.
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <GroupLabel>Preset</GroupLabel>
        <SelectControl label="Preset" value={s.preset} options={PRESETS} onChange={applyPreset} />
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
              onChange={(v) => update({ [f.key]: v } as Partial<ImageParticles3DSettings>)}
              format={(v) => fmt(v, f.unit)}
            />
          ))}
          {g.title === "Scene" && (
            <Toggle label="Auto Rotate" checked={s.autoRotate} onChange={(v) => update({ autoRotate: v })} />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <GroupLabel>Color</GroupLabel>
        <SelectControl
          label="Color Mode"
          value={s.colorMode}
          options={COLOR_MODES}
          onChange={(v) => update({ colorMode: v as ImageColorMode })}
        />
        <ColorField label="Color A" value={s.colorA} onChange={(v) => update({ colorA: v })} />
        <ColorField label="Color B" value={s.colorB} onChange={(v) => update({ colorB: v })} />
        <SliderControl
          label="Glow"
          value={s.glow}
          min={0}
          max={100}
          step={1}
          onChange={(v) => update({ glow: v })}
          format={(v) => `${Math.round(v)}%`}
        />
        <SliderControl
          label="Opacity"
          value={s.opacity}
          min={0}
          max={100}
          step={1}
          onChange={(v) => update({ opacity: v })}
          format={(v) => `${Math.round(v)}%`}
        />
        <ColorField label="Background" value={s.background} onChange={(v) => update({ background: v })} />
      </div>
    </div>
  );
}
