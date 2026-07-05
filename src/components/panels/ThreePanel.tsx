import { Boxes } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { THREE_TOOLS } from "../../data/three";

/* Left panel for 3D mode — the 3D objects/effects list. */

export function ThreePanel() {
  const tool = useAppStore((s) => s.three3DTool);

  return (
    <div className="flex flex-col gap-3.5">
      <span className="px-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-linen/45">
        3D Objects
      </span>
      <div className="flex flex-col gap-1">
        {THREE_TOOLS.map((t) => {
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              className={
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors " +
                (active
                  ? "border-flame/50 bg-flame/12 text-flame"
                  : "border-transparent bg-[#141414] text-linen/70")
              }
            >
              <Boxes className="size-4 shrink-0" strokeWidth={1.85} />
              <span className="flex-1 text-[13px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
      <p className="px-1 text-[10px] text-linen/30">
        Edit shape and motion in the Properties panel. Drag the viewport to
        orbit; scroll to zoom.
      </p>
    </div>
  );
}
