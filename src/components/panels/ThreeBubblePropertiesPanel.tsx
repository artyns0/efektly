import { Droplet } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { ElasticBubble3DSettings } from "../../types/three";
import { SliderControl } from "../controls/SliderControl";
import { Toggle } from "../controls/Toggle";
import { ColorField } from "../controls/ColorField";

/* Right Properties panel for Elastic Bubble 3D. */

type Key = keyof ElasticBubble3DSettings;
type Slider = { key: Key; label: string; min: number; max: number; step?: number; unit?: string };
type Group = { title: string; sliders: Slider[]; toggle?: { key: Key; label: string } };

const pct = (key: Key, label: string): Slider => ({ key, label, min: 0, max: 100, unit: "%" });

const GROUPS: Group[] = [
  {
    title: "Shape / Form",
    sliders: [
      pct("size", "Size"),
      { key: "stretchX", label: "Stretch X", min: 40, max: 200, unit: "%" },
      { key: "stretchY", label: "Stretch Y", min: 40, max: 200, unit: "%" },
      { key: "stretchZ", label: "Stretch Z", min: 40, max: 200, unit: "%" },
      pct("roundness", "Roundness"),
      pct("surfaceSmoothness", "Surface Smoothness"),
    ],
  },
  {
    title: "Soft Body / Elasticity",
    sliders: [
      pct("elasticity", "Elasticity"), pct("softness", "Softness"),
      pct("wobble", "Wobble"), pct("damping", "Damping"),
      pct("recovery", "Recovery"), pct("blobStrength", "Blob Strength"),
    ],
  },
  {
    title: "Motion",
    sliders: [
      { key: "speed", label: "Animation Speed", min: 0, max: 3, step: 0.05, unit: "x" },
      pct("turbulence", "Turbulence"), pct("noiseScale", "Noise Scale"),
      pct("flow", "Flow Amount"), pct("drift", "Drift"),
      { key: "loopDuration", label: "Loop Duration", min: 1, max: 20, step: 0.5, unit: "s" },
    ],
    toggle: { key: "autoMotion", label: "Auto Motion" },
  },
  {
    title: "Wind",
    sliders: [
      pct("windStrength", "Wind Strength"),
      { key: "windX", label: "Wind Direction X", min: -100, max: 100 },
      { key: "windY", label: "Wind Direction Y", min: -100, max: 100 },
      { key: "windZ", label: "Wind Direction Z", min: -100, max: 100 },
      pct("gust", "Gust Amount"),
    ],
  },
  {
    title: "Surface / Material",
    sliders: [
      pct("gloss", "Gloss"), pct("reflectivity", "Reflectivity"),
      pct("refraction", "Refraction"), pct("fresnel", "Fresnel"),
      pct("chromatic", "Iridescence"), pct("rimLight", "Rim Light"),
      pct("opacity", "Opacity"),
    ],
  },
  {
    title: "Rotation / Scene",
    sliders: [
      { key: "rotateX", label: "Rotate X", min: 0, max: 360, unit: "°" },
      { key: "rotateY", label: "Rotate Y", min: 0, max: 360, unit: "°" },
      { key: "rotateZ", label: "Rotate Z", min: 0, max: 360, unit: "°" },
      pct("lightIntensity", "Light Intensity"),
      { key: "lightX", label: "Light X", min: -100, max: 100 },
      { key: "lightY", label: "Light Y", min: -100, max: 100 },
      { key: "lightZ", label: "Light Z", min: -100, max: 100 },
      pct("cameraDistance", "Camera Distance"),
    ],
    toggle: { key: "autoRotate", label: "Auto Rotate" },
  },
];

const COLORS: { key: Key; label: string }[] = [
  { key: "baseColor", label: "Base Color" },
  { key: "highlightColor", label: "Highlight Color" },
  { key: "shadowTint", label: "Shadow Tint" },
  { key: "emissiveTint", label: "Emissive Tint" },
  { key: "background", label: "Background" },
];

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-linen/45">
      {children}
    </span>
  );
}

export function ThreeBubblePropertiesPanel() {
  const s = useAppStore((st) => st.elasticBubble3D);
  const update = useAppStore((st) => st.updateElasticBubble3D);
  const fmt = (v: number, unit?: string, step?: number) =>
    `${step && step < 1 ? v.toFixed(2) : Math.round(v)}${unit ?? ""}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-flame/30 bg-flame/10 text-flame">
          <Droplet className="size-4" strokeWidth={1.8} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-linen">
            Elastic Bubble 3D
          </span>
          <span className="text-[10px] uppercase tracking-wide text-linen/40">
            3D Object
          </span>
        </span>
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
              onChange={(v) => update({ [f.key]: v } as Partial<ElasticBubble3DSettings>)}
              format={(v) => fmt(v, f.unit, f.step)}
            />
          ))}
          {g.toggle && (
            <Toggle
              label={g.toggle.label}
              checked={s[g.toggle.key] as boolean}
              onChange={(v) =>
                update({ [g.toggle!.key]: v } as Partial<ElasticBubble3DSettings>)
              }
            />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <GroupLabel>Color</GroupLabel>
        {COLORS.map((c) => (
          <ColorField
            key={c.key}
            label={c.label}
            value={s[c.key] as string}
            onChange={(v) => update({ [c.key]: v } as Partial<ElasticBubble3DSettings>)}
          />
        ))}
        <SliderControl
          label="Color Shift Amount"
          value={s.colorShift}
          min={0}
          max={100}
          step={1}
          onChange={(v) => update({ colorShift: v })}
          format={(v) => `${Math.round(v)}%`}
        />
      </div>
    </div>
  );
}
