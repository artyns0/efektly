import { useAppStore } from "../../../store/useAppStore";
import type { EffectInstance, EffectSettingsPatch } from "../../../types/effects";
import { EFFECT_SCHEMAS, type FieldDef } from "../../../data/effectSchemas";
import { SliderControl } from "../../controls/SliderControl";
import { SelectControl } from "../../controls/SelectControl";
import { Toggle } from "../../controls/Toggle";
import { ColorField } from "../../controls/ColorField";

/* Schema-driven controls for the v2 effect pack. */

export function GenericEffectControls({ effect }: { effect: EffectInstance }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const schema = EFFECT_SCHEMAS[effect.type];
  if (!schema) return null;

  const settings = effect.settings as unknown as Record<string, unknown>;
  const set = (patch: Record<string, unknown>) =>
    update(effect.id, patch as EffectSettingsPatch);

  const renderField = (f: FieldDef) => {
    switch (f.kind) {
      case "slider": {
        const v = Number(settings[f.key] ?? f.min);
        const fmtVal = (x: number) =>
          `${f.step && f.step < 1 ? x.toFixed(2) : Math.round(x)}${f.unit ?? ""}`;
        return (
          <SliderControl
            key={f.key}
            label={f.label}
            value={v}
            min={f.min}
            max={f.max}
            step={f.step ?? 1}
            onChange={(x) => set({ [f.key]: x })}
            format={fmtVal}
          />
        );
      }
      case "select":
        return (
          <SelectControl
            key={f.key}
            label={f.label}
            value={String(settings[f.key] ?? "")}
            options={f.options}
            onChange={(v) => set({ [f.key]: v, ...(f.patches?.[v] ?? {}) })}
          />
        );
      case "toggle":
        return (
          <Toggle
            key={f.key}
            label={f.label}
            checked={Boolean(settings[f.key])}
            onChange={(v) => set({ [f.key]: v })}
          />
        );
      case "color":
        return (
          <ColorField
            key={f.key}
            label={f.label}
            value={String(settings[f.key] ?? "#131313")}
            onChange={(v) => set({ [f.key]: v })}
          />
        );
    }
  };

  return <div className="flex flex-col gap-5">{schema.map(renderField)}</div>;
}
