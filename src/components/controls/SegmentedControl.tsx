import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className="grid gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1"
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
              "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
              size === "md" ? "h-9 text-sm" : "h-8 text-xs",
              active
                ? "bg-flame text-onyx shadow-[0_4px_18px_-6px] shadow-flame/60"
                : "text-linen/60 hover:text-linen hover:bg-white/[0.04]",
            )}
          >
            {seg.icon}
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
