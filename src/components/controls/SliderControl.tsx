import { cn } from "../../lib/cn";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Formats the right-aligned value readout (e.g. "1.25x", "80%"). */
  format?: (value: number) => string;
  className?: string;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.05,
  onChange,
  format = (v) => String(v),
  className,
}: SliderControlProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-linen/70">{label}</span>
        <span className="font-mono text-xs text-linen/90 tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        className="ef-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-label={label}
      />
    </div>
  );
}
