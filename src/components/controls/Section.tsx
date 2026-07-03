import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "../../lib/cn";

interface SectionProps {
  /** Step number in the pipeline (Input -> Source -> Effects -> ...). */
  index?: number;
  title: string;
  /** Optional element rendered on the far right of the header (e.g. a menu). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A soft, glass-like control card. Onyx base lifted with a warm translucent
 * linen layer, a top-light sheen, and a restrained Tiger Flame edge highlight.
 */
export function Section({
  index,
  title,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-[22px] p-5",
        "border border-white/[0.07] bg-linen/[0.035] backdrop-blur-2xl",
        "shadow-[inset_0_1px_0_0_rgba(243,240,232,0.05),0_18px_40px_-30px_rgba(0,0,0,0.95)]",
        className,
      )}
    >
      {/* glassy top-light sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(243,240,232,0.06), rgba(243,240,232,0.012) 38%, transparent 70%)",
        }}
      />
      {/* warm flame highlight along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,90,31,0.45), transparent)",
        }}
      />

      <header className="relative mb-4 flex items-center gap-2.5">
        {index !== undefined && (
          <span className="grid size-6 place-items-center rounded-lg bg-flame/15 font-mono text-xs font-semibold text-flame ring-1 ring-inset ring-flame/25">
            {index}
          </span>
        )}
        <h2 className="text-[15px] font-medium tracking-tight text-linen">
          {title}
        </h2>
        <Info className="size-3.5 text-linen/25" strokeWidth={1.75} />
        {action && <div className="ml-auto">{action}</div>}
      </header>
      <div className="relative">{children}</div>
    </section>
  );
}
