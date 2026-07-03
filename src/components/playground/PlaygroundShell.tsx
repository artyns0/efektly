import { PreviewWorkspace } from "../layout/PreviewWorkspace";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { PlaygroundRail } from "./PlaygroundRail";
import { PlaygroundPanel } from "./PlaygroundPanel";
import { PlaygroundTimeline } from "./PlaygroundTimeline";
import { PlaygroundExportProject } from "./PlaygroundExportProject";
import { PlaygroundStatusBar } from "./PlaygroundStatusBar";

/* ------------------------------------------------------------------ */
/*  Motion-design playground layout (behind ?layout=playground).       */
/*  Regions:                                                           */
/*    toolbar / rail / left panel / center(preview + timeline) /       */
/*    right panel / status bar. All real widgets are reused from the   */
/*    existing app; the timeline + some panel sections are shells.     */
/* ------------------------------------------------------------------ */

export function PlaygroundShell() {
  return (
    <div className="h-screen w-screen overflow-x-auto overflow-y-hidden bg-onyx text-linen">
      <div className="flex h-full min-w-[1280px] flex-col">
        <PlaygroundToolbar />

        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {/* Left rail */}
          <PlaygroundRail />

          {/* Left panel */}
          <aside className="scroll-thin w-[320px] shrink-0 overflow-y-auto rounded-2xl border border-white/[0.06] bg-linen/[0.015] p-3">
            <PlaygroundPanel />
          </aside>

          {/* Center: preview + timeline */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex min-h-0 flex-[3]">
              <PreviewWorkspace />
            </div>
            <div className="h-56 shrink-0">
              <PlaygroundTimeline />
            </div>
          </div>

          {/* Right panel */}
          <aside className="scroll-thin w-[300px] shrink-0 overflow-y-auto rounded-2xl border border-white/[0.06] bg-linen/[0.015] p-3">
            <PlaygroundExportProject />
          </aside>
        </div>

        <PlaygroundStatusBar />
      </div>
    </div>
  );
}
