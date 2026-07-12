/* ------------------------------------------------------------------ */
/*  Trigger a local file download from a Blob. Local-first — no upload. */
/* ------------------------------------------------------------------ */

import { emitFlapReaction } from "../lib/flapEvents";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download from an existing object URL without revoking it (caller owns it). */
export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  emitFlapReaction("celebrate");
}
