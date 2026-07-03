/* ------------------------------------------------------------------ */
/*  Small time helpers for export filenames and recording readouts.   */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");

/** Compact timestamp for filenames, e.g. "20260702-153012". */
export function fileTimestamp(date = new Date()): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** Milliseconds -> "m:ss" clock, e.g. 5200 -> "0:05". */
export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad(s)}`;
}

/** Human-readable byte size, e.g. "1.2 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
