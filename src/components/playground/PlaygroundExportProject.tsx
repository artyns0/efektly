import { ExportPanel } from "../panels/ExportPanel";

/* ------------------------------------------------------------------ */
/*  Right panel: the real Export panel + a shell-only Project card.    */
/* ------------------------------------------------------------------ */

function ProjectRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5 text-sm">
      <span className="text-linen/60">{label}</span>
      <span className="font-mono text-xs text-linen/75">{value}</span>
    </div>
  );
}

export function PlaygroundExportProject() {
  return (
    <div className="flex flex-col gap-5">
      <ExportPanel />

      {/* Project card — shell only (no backend / cloud) */}
      <div className="flex flex-col gap-3">
        <span className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-linen/40">
          Project
        </span>
        <ProjectRow label="Name" value="Efektly Project 01" />
        <ProjectRow label="Resolution" value="1920 × 1080" />
        <ProjectRow label="Duration" value="00:10:00" />
        <ProjectRow label="Frame Rate" value="60 fps" />
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-linen/[0.02] px-3 py-2.5 text-sm">
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
