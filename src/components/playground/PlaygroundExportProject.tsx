import { useAppStore } from "../../store/useAppStore";
import { ExportPanel } from "../panels/ExportPanel";
import { VideoRecordButton } from "./VideoRecordButton";

/* ------------------------------------------------------------------ */
/*  Right panel: the real Export panel + a compact Project card.       */
/*  Project name is editable (persisted to localStorage); the rest is   */
/*  display-only for now.                                              */
/* ------------------------------------------------------------------ */

function ProjectRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2 text-sm">
      <span className="text-linen/60">{label}</span>
      <span className="font-mono text-xs text-linen/75">{value}</span>
    </div>
  );
}

export function PlaygroundExportProject() {
  const projectName = useAppStore((s) => s.projectName);
  const setProjectName = useAppStore((s) => s.setProjectName);

  return (
    <div className="flex flex-col gap-4 pt-8">
      <ExportPanel videoRecordAction={<VideoRecordButton />} />

      {/* Project card — name editable; other fields display-only for now */}
      <div className="flex flex-col gap-2">
        <span className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
          Project
        </span>

        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs text-linen/50">Project Name</span>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Untitled Project"
            aria-label="Project name"
            className="h-10 rounded-xl border border-white/[0.07] bg-black/20 px-3 text-sm text-linen transition-colors hover:border-white/[0.14] focus:border-flame/50 focus:outline-none"
          />
        </label>

        <ProjectRow label="Resolution" value="1920 × 1080" />
        <ProjectRow label="Duration" value="00:10:00" />
        <ProjectRow label="Frame Rate" value="60 fps" />
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2 text-sm">
          <span className="text-linen/60">Autosave</span>
          <span className="flex items-center gap-1.5 text-xs text-linen/75">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Local · Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
