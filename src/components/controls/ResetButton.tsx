import { RotateCcw } from "lucide-react";

/** Small icon button that restores a panel's settings to defaults. */
export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Reset to defaults"
      title="Reset to defaults"
      className="grid size-6 shrink-0 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-white/[0.06] hover:text-linen"
    >
      <RotateCcw className="size-3.5" strokeWidth={2} />
    </button>
  );
}
