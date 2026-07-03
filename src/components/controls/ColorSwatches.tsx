import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";

interface ColorSwatchesProps {
  colors: string[];
  active: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

export function ColorSwatches({
  colors,
  active,
  onSelect,
  onAdd,
}: ColorSwatchesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {colors.map((color, i) => {
        const isActive = i === active;
        return (
          <button
            key={`${color}-${i}`}
            onClick={() => onSelect(i)}
            aria-label={`Select color ${color}`}
            aria-pressed={isActive}
            className={cn(
              "size-9 rounded-full transition-transform duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/60",
              isActive
                ? "ring-2 ring-flame ring-offset-2 ring-offset-onyx scale-105"
                : "ring-1 ring-white/10 hover:scale-105",
            )}
            style={{ backgroundColor: color }}
          />
        );
      })}

      <button
        onClick={onAdd}
        aria-label="Add color"
        className={cn(
          "grid size-9 place-items-center rounded-full border border-dashed border-white/20",
          "text-linen/50 transition-colors hover:border-flame/60 hover:text-flame",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/60",
        )}
      >
        <Plus className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
