import { useAppStore } from "../../../store/useAppStore";
import type {
  ShaderColorMode,
  ShaderSettingsPatch,
  ShaderTypeId,
} from "../../../types/shaders";
import { SliderControl } from "../../controls/SliderControl";
import { SegmentedControl } from "../../controls/SegmentedControl";
import { Toggle } from "../../controls/Toggle";
import { SelectControl } from "../../controls/SelectControl";
import { ColorField } from "../../controls/ColorField";

const COLOR_MODES: { value: ShaderColorMode; label: string }[] = [
  { value: "brand", label: "Brand" },
  { value: "mono", label: "Mono" },
  { value: "duo", label: "Duo" },
];

/* Declarative param schemas for the v2 shader pack. Colors A/B/background
   live in the panel's Colors section; extra colors appear here. */
type SField =
  | { kind: "slider"; key: string; label: string; min: number; max: number; step?: number; unit?: string }
  | { kind: "toggle"; key: string; label: string }
  | { kind: "color"; key: string; label: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] };

const pctS = (key: string, label: string): SField => ({
  kind: "slider", key, label, min: 0, max: 100, step: 1, unit: "%",
});
const speedS = (key = "speed", label = "Speed"): SField => ({
  kind: "slider", key, label, min: 0, max: 3, step: 0.05, unit: "x",
});

const SHADER_SCHEMAS: Partial<Record<ShaderTypeId, SField[]>> = {
  fluidLines: [
    { kind: "slider", key: "lineCount", label: "Line Count", min: 2, max: 60, step: 1 },
    { kind: "slider", key: "lineWidth", label: "Line Width", min: 0.5, max: 6, step: 0.1, unit: "px" },
    pctS("spacing", "Spacing"), pctS("amplitude", "Amplitude"), pctS("frequency", "Frequency"),
    speedS("flowSpeed", "Flow Speed"), pctS("distortion", "Distortion"),
  ],
  inkFlow: [
    pctS("spread", "Spread"), speedS("flowSpeed", "Flow Speed"), pctS("diffusion", "Diffusion"),
    pctS("density", "Density"), pctS("softness", "Softness"), pctS("noise", "Noise"),
  ],
  orbitParticles: [
    { kind: "slider", key: "count", label: "Particle Count", min: 10, max: 400, step: 5 },
    pctS("radius", "Radius"), speedS("orbitSpeed", "Orbit Speed"),
    pctS("particleSize", "Particle Size"), pctS("glow", "Glow"), pctS("spread", "Spread"),
    { kind: "slider", key: "centerX", label: "Center X", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "centerY", label: "Center Y", min: 0, max: 1, step: 0.01 },
  ],
  sparkBurst: [
    { kind: "slider", key: "count", label: "Max Particles", min: 50, max: 1200, step: 10 },
    pctS("emitRate", "Emit Rate"), pctS("sparkSize", "Spark Size"),
    pctS("spread", "Spread"), speedS(), pctS("drag", "Drag"),
    pctS("gravity", "Gravity"), pctS("decay", "Decay"), pctS("glow", "Glow"),
    pctS("burstStrength", "Burst Strength"), pctS("trailLength", "Trail Length"),
    { kind: "toggle", key: "mouseFollow", label: "Mouse Follow" },
    { kind: "toggle", key: "autoBurst", label: "Auto Emit" },
  ],
  kineticLines: [
    { kind: "slider", key: "lineCount", label: "Line Count", min: 2, max: 120, step: 1 },
    { kind: "slider", key: "lineWidth", label: "Line Width", min: 0.3, max: 6, step: 0.1, unit: "px" },
    pctS("scale", "Scale"),
    { kind: "slider", key: "centerX", label: "Center X", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "centerY", label: "Center Y", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "rotation", label: "Rotation", min: 0, max: 360, step: 1, unit: "°" },
    pctS("morph", "Morph"), pctS("noise", "Noise"), pctS("glow", "Glow"),
    pctS("opacity", "Opacity"), speedS(),
    { kind: "slider", key: "loopDuration", label: "Loop Duration", min: 1, max: 20, step: 0.5, unit: "s" },
    { kind: "toggle", key: "invert", label: "Invert" },
  ],
  auraOrb: [
    pctS("radius", "Radius"), pctS("edgeSoftness", "Edge Softness"),
    pctS("rimWidth", "Rim Width"), pctS("roundness", "Roundness"),
    { kind: "slider", key: "centerX", label: "Center X", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "centerY", label: "Center Y", min: 0, max: 1, step: 0.01 },
    pctS("glowIntensity", "Glow Intensity"), pctS("glowRadius", "Glow Radius"),
    pctS("auraFalloff", "Aura Falloff"), pctS("bloomAmount", "Bloom Amount"),
    pctS("bloomRadius", "Bloom Radius"),
    speedS("flowSpeed", "Flow Speed"), pctS("flowScale", "Flow Scale"),
    pctS("flowDistortion", "Flow Distortion"), pctS("innerBand", "Inner Band Strength"),
    pctS("plasma", "Plasma Amount"), pctS("noise", "Noise Amount"),
    { kind: "slider", key: "rotation", label: "Rotation", min: 0, max: 360, step: 1, unit: "°" },
    { kind: "color", key: "highlightColor", label: "Highlight Color" },
    { kind: "color", key: "rimColor", label: "Rim Color" },
    pctS("colorShift", "Color Shift"),
    speedS(), pctS("pulseAmount", "Pulse Amount"),
    speedS("pulseSpeed", "Pulse Speed"),
    { kind: "slider", key: "loopDuration", label: "Loop Duration", min: 1, max: 20, step: 0.5, unit: "s" },
  ],
  holoyudu: [
    { kind: "color", key: "colorC", label: "Color C" },
    { kind: "slider", key: "colorCount", label: "Color Count", min: 1, max: 3, step: 1 },
    pctS("hueShift", "Hue Shift"), pctS("saturation", "Saturation"),
    pctS("blendAmount", "Blend Amount"),
    pctS("highlightStrength", "Highlight Strength"),
    { kind: "slider", key: "highlightAngle", label: "Highlight Angle", min: 0, max: 360, step: 1, unit: "°" },
    pctS("highlightWidth", "Highlight Width"), pctS("highlightSoftness", "Highlight Softness"),
    pctS("gloss", "Shine / Gloss"),
    pctS("flowStrength", "Flow Strength"),
    { kind: "slider", key: "flowAngle", label: "Flow Angle", min: 0, max: 360, step: 1, unit: "°" },
    pctS("flowDensity", "Flow Density"), speedS("flowSpeed", "Flow Speed"),
    pctS("fluidMap", "Fluid Map Amount"), pctS("distortion", "Distortion"),
    pctS("noise", "Noise Amount"),
    pctS("interferenceScale", "Interference Scale"), pctS("bandDensity", "Band Density"),
    pctS("bandSoftness", "Band Softness"), pctS("textureInfluence", "Texture Influence"),
    pctS("luminanceInfluence", "Luminance Influence"), pctS("edgeInfluence", "Edge Influence"),
    pctS("opacity", "Opacity"),
    { kind: "toggle", key: "preserveDark", label: "Preserve Dark Areas" },
  ],
  nebulas: [
    /* 1 — performance */
    pctS("pixelRatio", "Pixel Ratio"),
    { kind: "slider", key: "maxIterations", label: "Max Iterations", min: 2, max: 16, step: 1 },
    pctS("stepSize", "Step Size"),
    {
      kind: "select", key: "qualityMode", label: "Quality Mode",
      options: [
        { value: "draft", label: "Draft" },
        { value: "balanced", label: "Balanced" },
        { value: "high", label: "High" },
      ],
    },
    /* 2 — nebula controls */
    speedS("evolutionSpeed", "Evolution Speed"),
    pctS("fogDensity", "Fog Density"),
    pctS("detailScale", "Detail Scale"),
    pctS("fieldRadius", "Field Radius"),
    pctS("glowSoftness", "Glow Softness"),
    pctS("contrast", "Contrast"),
    pctS("softness", "Softness"),
    pctS("flowStrength", "Flow Strength"),
    pctS("warp", "Distortion / Warp"),
    pctS("depthFade", "Depth Fade"),
    pctS("brightness", "Brightness"),
    /* 3 — color phase */
    pctS("redPhase", "Red Phase"),
    pctS("greenPhase", "Green Phase"),
    pctS("bluePhase", "Blue Phase"),
    /* 4 — motion / composition */
    pctS("drift", "Drift"),
    pctS("swirl", "Swirl"),
    { kind: "slider", key: "rotation", label: "Rotation", min: 0, max: 360, step: 1, unit: "°" },
    pctS("centerPull", "Center Pull"),
    pctS("spread", "Spread"),
    speedS("loopSpeed", "Loop Speed"),
    { kind: "toggle", key: "autoAnimate", label: "Auto Animate" },
    /* 5 — color / look */
    pctS("saturation", "Saturation"),
    pctS("highlights", "Highlights"),
    pctS("bloom", "Bloom / Glow"),
    pctS("prism", "Spectral Separation"),
    pctS("backgroundMix", "Background Mix"),
    pctS("colorBalance", "Color Balance"),
    pctS("opacity", "Opacity"),
  ],
};

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

  // Schema-driven params for the v2 shader pack.
  const schema = SHADER_SCHEMAS[type];
  if (schema) {
    const sset = settings[type] as unknown as Record<string, unknown>;
    return (
      <div className="flex flex-col gap-5">
        {schema.map((f) => {
          if (f.kind === "slider") {
            const fmtVal = (x: number) =>
              `${f.step && f.step < 1 ? x.toFixed(2) : Math.round(x)}${f.unit ?? ""}`;
            return (
              <SliderControl
                key={f.key}
                label={f.label}
                value={Number(sset[f.key] ?? f.min)}
                min={f.min}
                max={f.max}
                step={f.step ?? 1}
                onChange={(v) => set({ [f.key]: v } as ShaderSettingsPatch)}
                format={fmtVal}
              />
            );
          }
          if (f.kind === "toggle") {
            return (
              <Toggle
                key={f.key}
                label={f.label}
                checked={Boolean(sset[f.key])}
                onChange={(v) => set({ [f.key]: v } as ShaderSettingsPatch)}
              />
            );
          }
          if (f.kind === "select") {
            return (
              <SelectControl
                key={f.key}
                label={f.label}
                value={String(sset[f.key] ?? f.options[0].value)}
                options={f.options}
                onChange={(v) => set({ [f.key]: v } as ShaderSettingsPatch)}
              />
            );
          }
          return (
            <ColorField
              key={f.key}
              label={f.label}
              value={String(sset[f.key] ?? "#131313")}
              onChange={(v) => set({ [f.key]: v } as ShaderSettingsPatch)}
            />
          );
        })}
      </div>
    );
  }

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
