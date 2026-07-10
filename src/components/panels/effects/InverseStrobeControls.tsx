import { AlertTriangle } from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";
import type { EffectInstance, InverseStrobeSettings } from "../../../types/effects";
import { GenericEffectControls } from "./GenericEffectControls";

/* ------------------------------------------------------------------ */
/*  Inverse Strobe controls — schema sliders plus a photosensitivity    */
/*  gate. The rapid four-phase flashing stays locked to a calm B/W      */
/*  phase until the warning is explicitly acknowledged.                */
/* ------------------------------------------------------------------ */

export function InverseStrobeControls({ effect }: { effect: EffectInstance }) {
  const update = useAppStore((s) => s.updateEffectSettings);
  const s = effect.settings as InverseStrobeSettings;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-flame/30 bg-flame/[0.06] p-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-flame">
          <AlertTriangle className="size-4" strokeWidth={2} />
          Rapid flashing effect
        </span>
        <p className="text-xs leading-relaxed text-linen/60">
          This effect produces rapid flashing that may trigger seizures in people
          with photosensitive epilepsy.
        </p>
        {s.acknowledged ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-linen/40">Flashing enabled.</span>
            <button
              type="button"
              onClick={() => update(effect.id, { acknowledged: false })}
              className="rounded-md border border-white/[0.1] px-2 py-1 text-[11px] text-linen/60 transition-colors hover:text-linen"
            >
              Disable flashing
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => update(effect.id, { acknowledged: true })}
            className="mt-0.5 rounded-lg border border-flame/50 bg-flame/15 px-3 py-2 text-xs font-medium text-flame transition-colors hover:bg-flame/25"
          >
            I understand — enable flashing
          </button>
        )}
      </div>

      <GenericEffectControls effect={effect} />
    </div>
  );
}
