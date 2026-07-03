import type { ReactNode } from "react";
import { Logo } from "../layout/Logo";

/* ------------------------------------------------------------------ */
/*  Phase 3a — Playground layout skeleton (behind ?layout=playground). */
/*  Structural regions only; existing widgets are mounted in 3b:       */
/*                                                                     */
/*    ┌────────────────── toolbar ──────────────────┐                  */
/*    │ rail │ panel │   preview    │ right panel   │                  */
/*    │      │       ├──────────────┤               │                  */
/*    │      │       │   timeline   │               │                  */
/*    └────────────────── status bar ───────────────┘                  */
/* ------------------------------------------------------------------ */

/** Placeholder card used in every region during 3a. */
function RegionPlaceholder({
  label,
  hint,
  className = "",
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "flex size-full flex-col items-center justify-center gap-1.5 rounded-2xl " +
        "border border-dashed border-white/[0.08] bg-linen/[0.015] p-4 text-center " +
        className
      }
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-linen/35">
        {label}
      </span>
      {hint && <span className="text-[11px] text-linen/25">{hint}</span>}
    </div>
  );
}

function Region({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={"min-h-0 min-w-0 " + className}>{children}</div>;
}

export function PlaygroundShell() {
  return (
    <div className="h-screen w-screen overflow-x-auto overflow-y-hidden bg-onyx text-linen">
      <div className="flex h-full min-w-[1280px] flex-col">
        {/* Top toolbar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-[19px] font-semibold leading-none tracking-tight text-linen">
              Efektly
            </span>
            <span className="hidden text-[13px] leading-none text-linen/40 lg:inline">
              Upload. Stylize. Animate. Export.
            </span>
          </div>
          <div className="flex-1">
            <div className="mx-auto h-10 w-64">
              <RegionPlaceholder label="Media / Shader" />
            </div>
          </div>
          <div className="h-10 w-72">
            <RegionPlaceholder label="Actions" hint="Capture · Record · Export" />
          </div>
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {/* Left rail */}
          <Region className="w-16 shrink-0">
            <RegionPlaceholder label="Rail" />
          </Region>

          {/* Left panel */}
          <Region className="w-[320px] shrink-0">
            <RegionPlaceholder label="Panel" hint="Effects · Source · Settings" />
          </Region>

          {/* Center: preview + timeline */}
          <Region className="flex flex-1 flex-col gap-3">
            <Region className="flex-[3]">
              <RegionPlaceholder label="Live Preview" />
            </Region>
            <Region className="h-56 shrink-0">
              <RegionPlaceholder label="Timeline" hint="Arrives with Animate" />
            </Region>
          </Region>

          {/* Right panel */}
          <Region className="w-[300px] shrink-0">
            <RegionPlaceholder label="Export / Project" />
          </Region>
        </div>

        {/* Status bar */}
        <footer className="flex h-8 shrink-0 items-center justify-between border-t border-white/[0.06] px-4 text-[11px] text-linen/35">
          <span>Efektly — playground layout preview</span>
          <span>Phase 3a skeleton</span>
        </footer>
      </div>
    </div>
  );
}
