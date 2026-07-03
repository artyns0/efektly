import { cn } from "../../lib/cn";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/** A labeled swatch backed by a native color input. */
export function ColorField({
  label,
  value,
  onChange,
  disabled,
  className,
}: ColorFieldProps) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3",
        disabled && "opacity-40",
        className,
      )}
    >
      <span className="text-sm text-linen/70">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase text-linen/55 tabular-nums">
          {value}
        </span>
        <span className="relative size-7 overflow-hidden rounded-lg border border-white/15 shadow-[inset_0_1px_0_0_rgba(243,240,232,0.1)]">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>
      </span>
    </label>
  );
}
