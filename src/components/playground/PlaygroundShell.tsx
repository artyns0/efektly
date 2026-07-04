import { PanelRightClose, Upload } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { PreviewWorkspace } from "../layout/PreviewWorkspace";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { PlaygroundRail } from "./PlaygroundRail";
import { PlaygroundPanel } from "./PlaygroundPanel";
import { PlaygroundTimeline } from "./PlaygroundTimeline";
import { PlaygroundExportProject } from "./PlaygroundExportProject";
import { PlaygroundStatusBar } from "./PlaygroundStatusBar";

/* ------------------------------------------------------------------ */
/*  Motion-design playground layout (behind ?layout=playground).       */
/*  toolbar / rail / left panel / center(preview + timeline) /         */
/*  right panel (collapsible) / status bar. Widgets reuse the app.     */
/* ------------------------------------------------------------------ */

export function PlaygroundShell() {
  const rightOpen = useAppStore((s) => s.exportPanelOpen);
  const setRightOpen = useAppStore((s) => s.setExportPanelOpen);

  return (
    <div className="h-screen w-screen overflow-x-auto overflow-y-hidden bg-onyx text-linen">
      <div className="flex h-full min-w-[1240px] flex-col">
        <PlaygroundToolbar />

        <div className="flex min-h-0 flex-1 gap-2.5 p-2.5">
          {/* Left rail */}
          <PlaygroundRail />

          {/* Left panel */}
          <aside className="scroll-thin w-[320px] shrink-0 overflow-y-auto rounded-2xl border border-white/[0.06] bg-linen/[0.02] p-3">
            <PlaygroundPanel />
          </aside>

          {/* Center: preview + timeline */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex min-h-0 flex-[3]">
              <PreviewWorkspace />
            </div>
            <div className="h-52 shrink-0">
              <PlaygroundTimeline />
            </div>
          </div>

          {/* Right panel — collapsible */}
          {rightOpen ? (
            <aside className="scroll-thin relative w-[300px] shrink-0 overflow-y-auto rounded-2xl border border-white/[0.06] bg-linen/[0.02] p-3">
              <button
                type="button"
                aria-label="Collapse export panel"
                onClick={() => setRightOpen(false)}
                className="absolute right-2.5 top-2.5 z-10 grid size-7 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-linen/[0.06] hover:text-linen"
              >
                <PanelRightClose className="size-4" strokeWidth={1.8} />
              </button>
              <PlaygroundExportProject />
            </aside>
          ) : (
            <button
              type="button"
              aria-label="Expand export panel"
              onClick={() => setRightOpen(true)}
              className="flex w-10 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-linen/[0.02] py-4 text-linen/55 transition-colors hover:border-flame/30 hover:text-flame"
            >
              <Upload className="size-4" strokeWidth={1.9} />
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ writingMode: "vertical-rl" }}
              >
                Export
              </span>
            </button>
          )}
        </div>

        <PlaygroundStatusBar />
      </div>
    </div>
  );
}
