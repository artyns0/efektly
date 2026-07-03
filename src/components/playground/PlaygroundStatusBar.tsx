/* ------------------------------------------------------------------ */
/*  Bottom status strip — version, fps, a tip, and shortcut hints.     */
/* ------------------------------------------------------------------ */

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/[0.1] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-linen/60">
      {children}
    </kbd>
  );
}

export function PlaygroundStatusBar() {
  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-white/[0.06] px-4 text-[11px] text-linen/40">
      <span className="font-mono text-linen/50">Efektly v0.1.0</span>
      <span className="hidden md:inline">60 fps</span>
      <span className="hidden flex-1 truncate text-linen/35 lg:block">
        Tip: Use effects and presets to build motion-ready looks.
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <Key>Space</Key>
          <span className="hidden sm:inline">Play / Pause</span>
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Key>K</Key>
          <span>Add Keyframe</span>
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Key>L</Key>
          <span>Toggle Loop</span>
        </span>
      </div>
    </footer>
  );
}
