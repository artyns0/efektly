import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import {
  ACCEPT_ATTR,
  detectMediaKind,
  loadImageFromFile,
  loadVideoFromFile,
} from "../../lib/media";

/* ------------------------------------------------------------------ */
/*  Source card + uploader (images and videos).                        */
/*  The whole card is a drop target and a click-to-browse trigger,     */
/*  backed by a hidden file input. The thumbnail and metadata update   */
/*  to reflect the uploaded media; videos add playback controls below. */
/* ------------------------------------------------------------------ */

export function MediaSource({ variant = "row" }: { variant?: "row" | "hero" }) {
  const source = useAppStore((s) => s.source);
  const mediaType = useAppStore((s) => s.mediaType);
  const mediaUrl = useAppStore((s) => s.mediaUrl);
  const setImageMedia = useAppStore((s) => s.setImageMedia);
  const setVideoMedia = useAppStore((s) => s.setVideoMedia);
  const clearMedia = useAppStore((s) => s.clearMedia);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMedia = mediaUrl !== null;
  const isVideo = mediaType === "video";

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    const file = files?.[0];
    if (!file) return;
    const kind = detectMediaKind(file);
    if (!kind) {
      setError("Unsupported file. Use PNG, JPG, SVG, or MP4.");
      return;
    }
    try {
      if (kind === "image") {
        setImageMedia(await loadImageFromFile(file));
      } else {
        setVideoMedia(await loadVideoFromFile(file));
      }
    } catch (e) {
      // Surface the specific message (e.g. the 20-second limit) when present.
      const msg =
        e instanceof Error && /20 seconds/.test(e.message)
          ? e.message
          : `That ${kind} could not be opened.`;
      setError(msg);
    }
  };

  const dropHandlers = {
    onClick: () => inputRef.current?.click(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT_ATTR}
      className="hidden"
      onChange={(e) => {
        handleFiles(e.target.files);
        e.target.value = ""; // allow re-selecting the same file
      }}
    />
  );

  /* Hero variant — large centered dropzone for the playground Source tab. */
  if (variant === "hero" && !hasMedia) {
    return (
      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload media"
          {...dropHandlers}
          className={cn(
            "group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-9 text-center",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
            dragging
              ? "border-flame/60 bg-flame/[0.06]"
              : "border-white/[0.12] bg-black/20 hover:border-white/25 hover:bg-linen/[0.02]",
          )}
        >
          <span className="mb-1 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-flame shadow-inner">
            <ImagePlus className="size-6" strokeWidth={1.7} />
          </span>
          <p className="text-[15px] font-semibold text-linen">Add Media</p>
          <p className="text-xs text-linen/50">
            Drag &amp; drop or{" "}
            <span className="font-medium text-flame">browse</span>
          </p>
          <p className="text-[10px] text-linen/30">PNG · JPG · SVG · MP4</p>
        </div>
        {error && <p className="px-1 text-xs text-flame">{error}</p>}
        {fileInput}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={hasMedia ? "Replace media" : "Upload media"}
        {...dropHandlers}
        className={cn(
          "group flex items-center gap-3.5 rounded-2xl border border-dashed p-2.5 text-left",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50",
          dragging
            ? "border-flame/60 bg-flame/[0.06]"
            : "border-white/[0.1] hover:border-white/20 hover:bg-linen/[0.02]",
        )}
      >
        {/* Thumbnail — uploaded media, or the procedural placeholder */}
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(243,240,232,0.08)]">
          {hasMedia && mediaUrl ? (
            isVideo ? (
              <video
                src={mediaUrl}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={source.name}
                className="size-full object-cover"
              />
            )
          ) : (
            <ThumbnailPlaceholder />
          )}
        </div>

        {/* Metadata, or the upload prompt */}
        <div className="min-w-0 flex-1">
          {hasMedia ? (
            <>
              <p className="truncate text-[15px] font-medium text-linen">
                {source.name}
              </p>
              <p className="mt-1 font-mono text-xs text-linen/55">
                {source.width} × {source.height} · {source.format}
              </p>
              <p className="font-mono text-xs text-linen/40">
                {source.sizeLabel}
                {source.durationLabel ? ` · ${source.durationLabel}` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-[15px] font-medium text-linen">
                <ImagePlus className="size-4 text-flame" strokeWidth={2} />
                Upload media
              </p>
              <p className="mt-1 text-xs text-linen/50">
                Drag &amp; drop, or click to browse
              </p>
              <p className="text-xs text-linen/35">
                PNG · JPG · SVG · MP4
              </p>
            </>
          )}
        </div>

        {/* Clear button — only when media is present */}
        {hasMedia && (
          <button
            type="button"
            aria-label="Remove media"
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
              clearMedia();
            }}
            className="grid size-7 shrink-0 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-linen/[0.06] hover:text-linen"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {error && <p className="px-1 text-xs text-flame">{error}</p>}

      {fileInput}
    </div>
  );
}

function ThumbnailPlaceholder() {
  return (
    <>
      {/* Stand-in for the uploaded image — a warm, layered dune. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 70% 20%, rgba(255,90,31,0.35), transparent 55%), linear-gradient(160deg, #2a1d15 0%, #16110d 45%, #0b0b0b 100%)",
        }}
      />
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 88 88"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-4 58 Q 22 40 44 54 T 92 50"
          stroke="rgba(243,240,232,0.5)"
          strokeWidth="1"
        />
        <path
          d="M-4 70 Q 26 54 48 66 T 92 62"
          stroke="rgba(255,90,31,0.7)"
          strokeWidth="1"
        />
      </svg>
      <div className="absolute bottom-2 left-1/2 h-5 w-12 -translate-x-1/2 rounded-full bg-flame/25 blur-md" />
    </>
  );
}
