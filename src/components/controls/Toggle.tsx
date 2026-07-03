import { cn } from "../../lib/cn";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none"
    >
      <span className="flex flex-col">
        <span className="text-sm text-linen/85">{label}</span>
        {description && (
          <span className="text-xs text-linen/45">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-flame" : "bg-white/12",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-linen shadow transition-all duration-200",
            checked ? "left-[1.375rem]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
