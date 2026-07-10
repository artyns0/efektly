import { useEffect, useRef, useState } from "react";
import { FilePlus2, Images, MoveRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { useMediaImport } from "../../hooks/useMediaImport";
import { ACCEPT_ATTR } from "../../lib/media";
import { type UnsplashPhoto } from "../../lib/unsplash";
import { UnsplashPanel, UNSPLASH_DND_TYPE } from "./UnsplashPanel";
import {
  UPLOAD_COVER,
  WORKSPACE_CARDS,
  type WorkspaceCard,
  type WorkspaceCardId,
} from "./previewCards";

/* ------------------------------------------------------------------ */
/*  Preview welcome state — shown inside the preview frame when the     */
/*  app opens with no media loaded. A micro-dot field behind an upload  */
/*  card (click or drop to import) and three shortcuts into the other   */
/*  workspaces. Replaced by the live canvas as soon as media exists.    */
/* ------------------------------------------------------------------ */

const FORMATS = ["PNG", "JPEG", "SVG", "MP4"];

/** Cover art + the dark scrim that keeps the card text readable. */
function Cover({
  src,
  className,
  scrim,
}: {
  src: string;
  className: string;
  scrim: string;
}) {
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className={cn(
          "pointer-events-none absolute inset-0 size-full select-none object-cover opacity-[0.88] transition-opacity duration-200 ease-out group-hover:opacity-[0.97]",
          className,
        )}
      />
      <div className={cn("pointer-events-none absolute inset-0", scrim)} />
    </>
  );
}

function WorkspaceCardTile({
  card,
  wide,
  onOpen,
}: {
  card: WorkspaceCard;
  wide?: boolean;
  onOpen: (id: WorkspaceCardId) => void;
}) {
  const Icon = card.icon;
  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      className={cn(
        "group relative isolate flex size-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0D] text-left",
        "transition-[translate,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/[0.14]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40",
        wide ? "min-h-[190px] items-center" : "min-h-[260px] flex-col justify-end",
      )}
    >
      <Cover
        src={card.cover}
        className={card.coverClass}
        scrim={
          wide
            ? // Wide plate: art on the right, text reads over a left-side fade.
              "bg-gradient-to-r from-[#0C0C0D] via-[#0C0C0D]/85 to-transparent"
            : // Tall tile: art on top, text sits in the darkened lower half.
              "bg-gradient-to-t from-[#0C0C0D] via-[#0C0C0D]/85 to-transparent"
        }
      />

      <span
        className={cn(
          "relative z-10 flex flex-col gap-2 p-5",
          wide && "max-w-[62%]",
        )}
      >
        <Icon
          className="size-4 text-linen/40 transition-colors group-hover:text-flame"
          strokeWidth={1.75}
        />
        <span className="text-[15px] font-semibold text-linen">{card.title}</span>
        <span className="text-xs leading-relaxed text-linen/45">{card.helper}</span>
        <MoveRight className="mt-1 size-4 text-linen/25 transition-[translate,color] duration-200 ease-out group-hover:translate-x-[3px] group-hover:text-flame" />
      </span>
    </button>
  );
}

/** Fades + slides its child in on mount, matching the cluster's lift. */
function Reveal({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={cn(
        "transition-[opacity,translate] duration-300 ease-out",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

export function PreviewPlaceholder() {
  const setMode = useAppStore((s) => s.setMode);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const { handleFiles, importUnsplashPhoto, importing, error } = useMediaImport();

  // Files win; otherwise a photo dragged out of the Unsplash panel.
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
      return;
    }
    const raw = e.dataTransfer.getData(UNSPLASH_DND_TYPE);
    if (!raw) return;
    void importUnsplashPhoto(JSON.parse(raw) as UnsplashPhoto);
  };

  const openWorkspace = (id: WorkspaceCardId) => {
    if (id === "effects") {
      setMode("media");
      setRailSection("effects");
      // Effects need a source; say so instead of dropping the user into an
      // empty panel with no explanation.
      setHint("Import media first to apply effects.");
    } else if (id === "shader") {
      setMode("shader");
    } else {
      setMode("three");
    }
  };

  // The hint is a passing note, not a persistent message.
  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(null), 4000);
    return () => window.clearTimeout(id);
  }, [hint]);

  const [effects, shader, three] = WORKSPACE_CARDS;

  return (
    <div
      className="relative size-full overflow-auto bg-[#0B0B0C]"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        // dragleave also fires when crossing into a child, so only clear the
        // state once the pointer has actually left the preview.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      {/* Micro-dot field, faded toward the edges. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(243,240,232,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 45%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 45%, black 40%, transparent 100%)",
        }}
      />
      {/* Barely-there warm centre so the black does not read as flat. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(255,90,31,0.05), transparent 70%)",
        }}
      />

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

      <div className="relative grid min-h-full place-items-center p-6">
        <div className="flex w-full max-w-4xl flex-col gap-4">
          {/* Tall upload card on the left; two tiles above a wide plate right.
              The cluster lifts a little to make room for the library. */}
          <div
            className={cn(
              "grid gap-4 transition-transform duration-300 ease-out lg:grid-cols-3",
              stockOpen && "-translate-y-2",
            )}
          >
            {/* A div, not a button: the Free Stock Images CTA nests inside it. */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload media"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className={cn(
                "group relative isolate flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-8 lg:row-span-2 lg:min-h-[464px]",
                "transition-[translate,border-color,background-color] duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40",
                dragging
                  ? "border-dashed border-flame/60 bg-flame/[0.05]"
                  : "border-white/[0.07] bg-[#0C0C0D] hover:-translate-y-0.5 hover:border-flame/25",
              )}
            >
              <img
                src={UPLOAD_COVER}
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full select-none object-cover object-bottom opacity-[0.88] transition-opacity duration-200 ease-out group-hover:opacity-[0.97]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C0C0D]/30 via-[#0C0C0D]/80 to-[#0C0C0D]" />

              <span className="relative z-10 flex flex-col items-center gap-3">
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-xl border border-white/[0.07] bg-black/40 transition-colors duration-200",
                    dragging ? "text-flame" : "text-linen/30 group-hover:text-flame",
                  )}
                >
                  <FilePlus2 className="size-6" strokeWidth={1.5} />
                </span>
                <span className="text-lg font-semibold text-linen">
                  {dragging ? "Drop to import" : "Upload or Drag Media"}
                </span>
                <span className="max-w-[16rem] text-center text-xs leading-relaxed text-linen/45">
                  Add images or videos to start creating your vision.
                </span>
                <span className="text-xs font-medium text-flame/80 transition-colors duration-200 group-hover:text-flame">
                  Click to browse{" "}
                  <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-[3px]">
                    →
                  </span>
                </span>
              </span>

              <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-4 pt-6">
                <span className="flex flex-wrap justify-center gap-1.5">
                  {FORMATS.map((f) => (
                    <span
                      key={f}
                      className="rounded-md border border-white/[0.06] bg-black/50 px-2 py-1 font-mono text-[10px] tracking-wide text-linen/40"
                    >
                      {f}
                    </span>
                  ))}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // don't also open the file picker
                    setStockOpen((v) => !v);
                  }}
                  aria-expanded={stockOpen}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-black/50 px-3 py-2.5 text-left",
                    "transition-colors duration-200 ease-out hover:border-flame/30 hover:bg-black/70",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-linen/45 transition-colors group-hover:text-linen/60">
                    <Images className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[13px] font-medium text-linen">
                      Free Stock Images
                    </span>
                    <span className="text-[11px] text-linen/40">Unsplash</span>
                  </span>
                  <MoveRight
                    className={cn(
                      "size-4 shrink-0 text-linen/30 transition-transform duration-200 ease-out",
                      stockOpen ? "rotate-90 text-flame" : "",
                    )}
                  />
                </button>
              </div>
            </div>

            <WorkspaceCardTile card={effects} onOpen={openWorkspace} />
            <WorkspaceCardTile card={shader} onOpen={openWorkspace} />

            <div className="lg:col-span-2">
              <WorkspaceCardTile card={three} wide onOpen={openWorkspace} />
            </div>
          </div>

          {stockOpen && (
            <Reveal>
              <UnsplashPanel
                onClose={() => setStockOpen(false)}
                onPick={(p) => void importUnsplashPhoto(p)}
              />
            </Reveal>
          )}

          <p
            className={cn(
              "text-center text-xs transition-colors duration-200",
              error ? "text-flame" : hint ? "text-linen/70" : "text-linen/50",
            )}
          >
            {error ??
              hint ??
              (importing
                ? "Importing image…"
                : "Drag & drop media anywhere in the preview to import.")}
          </p>
        </div>
      </div>
    </div>
  );
}
