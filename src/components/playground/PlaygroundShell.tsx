import { PanelRightClose, Upload } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { PlaygroundPanel } from "./PlaygroundPanel";
import { PlaygroundPreview } from "./PlaygroundPreview";
import { PlaygroundRightPanel } from "./PlaygroundRightPanel";
import { PlaygroundStatusBar } from "./PlaygroundStatusBar";
import { useTimeline } from "./useTimeline";

/* ------------------------------------------------------------------ */
/*  Efektly main shell (default at /).                                 */
/*  toolbar / rail / left panel / center(preview + timeline) /         */
/*  right panel (collapsible) / status bar. Widgets reuse the app.     */
/* ------------------------------------------------------------------ */

export function PlaygroundShell() {
  const rightOpen = useAppStore((s) => s.exportPanelOpen);
  const setRightOpen = useAppStore((s) => s.setExportPanelOpen);
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const mediaImage = useAppStore((s) => s.mediaImage);
  const mediaVideo = useAppStore((s) => s.mediaVideo);
  useTimeline();

  // Startup state: Source mode with nothing loaded. The side panels have
  // nothing to act on yet, so they step aside and the welcome cards get the
  // full width. Any media, or any other mode, brings the editor back.
  const isWelcome =
    mode === "media" &&
    railSection === "source" &&
    mediaImage === null &&
    mediaVideo === null;

  return (
    <div className="h-screen w-screen overflow-x-auto overflow-y-hidden bg-[#070707] text-linen">
      <div className="flex h-full min-w-[1200px] flex-col">
        <PlaygroundToolbar />

        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {/* Left panel — hidden during the startup welcome state */}
          {!isWelcome && (
            <aside className="scroll-thin w-[320px] shrink-0 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0e0e0e] p-4">
              <PlaygroundPanel />
            </aside>
          )}

          {/* Center: preview (video transport lives inside the preview) */}
          <div className="flex min-w-0 flex-1 flex-col">
            <PlaygroundPreview />
          </div>

          {/* Right panel — collapsible, and absent during the welcome state */}
          {isWelcome ? null : rightOpen ? (
            <aside className="scroll-thin relative w-[320px] shrink-0 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0e0e0e] p-4">
              <button
                type="button"
                aria-label="Collapse export panel"
                onClick={() => setRightOpen(false)}
                className="absolute right-2.5 top-2.5 z-10 grid size-7 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-linen/[0.06] hover:text-linen"
              >
                <PanelRightClose className="size-4" strokeWidth={1.8} />
              </button>
              <PlaygroundRightPanel />
            </aside>
          ) : (
            <button
              type="button"
              aria-label="Expand export panel"
              onClick={() => setRightOpen(true)}
              className="flex w-10 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#0e0e0e] py-4 text-linen/55 transition-colors hover:border-flame/30 hover:text-flame"
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
