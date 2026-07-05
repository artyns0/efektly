import { Keyboard, MessageSquare, RefreshCw } from "lucide-react";

/* Playground v2 status strip: GPU/local · saved indicator · shortcuts/feedback. */

export function PlaygroundStatusBar() {
  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-white/[0.06] px-4 text-[11px] text-linen/40">
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-flame" />
        GPU Accelerated
      </span>
      <span className="hidden font-mono text-linen/30 md:inline">v0.1.0</span>
      <span className="mx-auto hidden items-center gap-1.5 text-linen/35 sm:flex">
        <RefreshCw className="size-3" />
        Project saved locally
      </span>
      <span className="ml-auto flex items-center gap-4 sm:ml-0">
        <span className="flex items-center gap-1.5">
          <Keyboard className="size-3.5" />
          <span className="hidden md:inline">Shortcuts</span>
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="size-3.5" />
          <span className="hidden md:inline">Feedback</span>
        </span>
      </span>
    </footer>
  );
}
