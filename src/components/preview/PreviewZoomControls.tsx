import { Maximize, Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Compact zoom control bar for the Live Preview: minus / percent /   */
/*  plus / fit. Dark glass style, Tiger Flame on hover.                */
/* ------------------------------------------------------------------ */

const BTN =
  "grid size-7 place-items-center rounded-lg text-linen/55 transition-colors " +
  "hover:bg-flame/10 hover:text-flame focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-flame/50 disabled:opacity-30 " +
  "disabled:hover:bg-transparent disabled:hover:text-linen/55";

interface PreviewZoomControlsProps {
  zoom: number; // 0.25 – 4
  onZoom: (next: number) => void;
  onFit: () => void;
}

export function PreviewZoomControls({
  zoom,
  onZoom,
  onFit,
}: PreviewZoomControlsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-white/[0.08]",
        "bg-onyx-100/80 px-1 py-1 backdrop-blur-xl",
      )}
    >
      <button
        type="button"
        aria-label="Zoom out"
        className={BTN}
        disabled={zoom <= 0.25}
        onClick={() => onZoom(zoom - 0.1)}
      >
        <Minus className="size-3.5" strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label="Reset zoom"
        title="Reset to 100%"
        onClick={() => onZoom(1)}
        className={cn(
          "h-7 min-w-12 rounded-lg px-1 text-center font-mono text-[11px] tabular-nums",
          "transition-colors hover:bg-flame/10",
          zoom !== 1 ? "text-flame" : "text-linen/60",
        )}
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        type="button"
        aria-label="Zoom in"
        className={BTN}
        disabled={zoom >= 4}
        onClick={() => onZoom(zoom + 0.1)}
      >
        <Plus className="size-3.5" strokeWidth={2} />
      </button>

      <span className="mx-0.5 h-4 w-px bg-white/[0.08]" />

      <button
        type="button"
        aria-label="Fit to view"
        title="Fit"
        className={BTN}
        onClick={onFit}
      >
        <Maximize className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
