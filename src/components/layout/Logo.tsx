import { cn } from "../../lib/cn";

interface LogoProps {
  className?: string;
}

/** The Efektly mark — a flame-colored spark/burst. */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      role="img"
      aria-label="Efektly"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        className="text-flame"
      >
        <line x1="16" y1="4" x2="16" y2="11" />
        <line x1="16" y1="21" x2="16" y2="28" />
        <line x1="4" y1="16" x2="11" y2="16" />
        <line x1="21" y1="16" x2="28" y2="16" />
        <line x1="7.5" y1="7.5" x2="12.3" y2="12.3" />
        <line x1="19.7" y1="19.7" x2="24.5" y2="24.5" />
        <line x1="24.5" y1="7.5" x2="19.7" y2="12.3" />
        <line x1="12.3" y1="19.7" x2="7.5" y2="24.5" />
      </g>
    </svg>
  );
}
