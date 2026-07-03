import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "ghost" | "primary" | "subtle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  ghost:
    "text-linen/80 hover:text-linen border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]",
  subtle: "text-linen/70 hover:text-linen hover:bg-white/[0.05]",
  primary:
    "text-onyx font-semibold bg-flame hover:bg-flame-soft border border-flame/60 shadow-[0_6px_24px_-6px] shadow-flame/50",
};

export function Button({
  variant = "ghost",
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/60",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
