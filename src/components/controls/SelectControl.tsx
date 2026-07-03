import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectControlProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function SelectControl({
  label,
  value,
  options,
  onChange,
  className,
}: SelectControlProps) {
  return (
    <label className={cn("flex items-center gap-3", className)}>
      {label && (
        <span className="shrink-0 text-sm text-linen/70">{label}</span>
      )}
      <div className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-full appearance-none rounded-xl border border-white/[0.07] bg-black/30",
            "px-3.5 pr-9 text-sm text-linen",
            "transition-colors hover:border-white/[0.14]",
            "focus:border-flame/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-flame/40",
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-onyx-100">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-linen/50"
          strokeWidth={1.75}
        />
      </div>
    </label>
  );
}
