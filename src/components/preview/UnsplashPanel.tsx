import { useEffect, useState } from "react";
import { ImageIcon, Search, Sparkles, X } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  photoLabel,
  searchPhotos,
  withUtm,
  UNSPLASH_HOME,
  type UnsplashPhoto,
} from "../../lib/unsplash";

/* ------------------------------------------------------------------ */
/*  Unsplash library — the expanded half of the Source onboarding.     */
/*  Results are hotlinked thumbnails served straight from Unsplash;    */
/*  the search itself goes through Efektly's own /api proxy so the     */
/*  Access Key never reaches the browser.                              */
/* ------------------------------------------------------------------ */

const PER_PAGE = 12;
const DEBOUNCE_MS = 450;

/** MIME-typed key the preview's drop handler looks for. */
export const UNSPLASH_DND_TYPE = "application/x-efektly-unsplash";

function Skeletons() {
  return (
    <>
      {Array.from({ length: PER_PAGE }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="aspect-[3/4] animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
          <div className="h-2 w-3/4 animate-pulse rounded bg-white/[0.03]" />
        </div>
      ))}
    </>
  );
}

/** Required credit. Visible under every result, not just on hover. */
function Attribution({ photo }: { photo: UnsplashPhoto }) {
  const link =
    "underline decoration-linen/20 underline-offset-2 transition-colors hover:text-linen/70";
  return (
    <p className="truncate text-[10px] leading-tight text-linen/35">
      Photo by{" "}
      <a
        href={withUtm(photo.photographerUrl)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={link}
      >
        {photo.photographerName}
      </a>{" "}
      on{" "}
      <a
        href={UNSPLASH_HOME}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={link}
      >
        Unsplash
      </a>
    </p>
  );
}

export function UnsplashPanel({
  onClose,
  onPick,
}: {
  onClose: () => void;
  /** Import a photo as the media source. */
  onPick: (photo: UnsplashPhoto) => void;
}) {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce typing into the committed term; Enter commits immediately.
  useEffect(() => {
    const id = window.setTimeout(() => setTerm(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // One request per committed term; stale ones are aborted.
  useEffect(() => {
    if (!term) {
      setPhotos([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    searchPhotos(term, PER_PAGE, controller.signal)
      .then((r) => {
        setPhotos(r);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Could not load stock images.");
        setPhotos([]);
        setLoading(false);
      });
    return () => controller.abort();
  }, [term]);

  const idle = !term && !loading && !error;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0D] p-5">
      <button
        type="button"
        aria-label="Close Unsplash library"
        onClick={onClose}
        className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg text-linen/40 transition-colors hover:bg-linen/[0.06] hover:text-linen"
      >
        <X className="size-4" strokeWidth={1.8} />
      </button>

      {/* Header + search */}
      <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-linen">
            <ImageIcon className="size-4 text-linen/50" strokeWidth={1.75} />
            Unsplash Library
          </span>
          <span className="text-xs text-linen/45">Browse free stock images.</span>
        </div>

        <label className="relative flex w-full max-w-[240px] items-center">
          <Search
            className="pointer-events-none absolute left-3 size-3.5 text-linen/35"
            strokeWidth={1.9}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setTerm(query.trim()); // skip the debounce
              }
            }}
            placeholder="Search free images..."
            className={cn(
              "h-9 w-full rounded-lg border border-white/[0.07] bg-black/40 pl-9 pr-3 text-xs text-linen placeholder:text-linen/30",
              "transition-colors focus:border-flame/40 focus:outline-none",
            )}
          />
        </label>
      </div>

      {/* Results */}
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {loading ? (
          <Skeletons />
        ) : (
          photos.map((p) => (
            <div key={p.id} className="flex min-w-0 flex-col gap-1.5">
              <button
                type="button"
                title={photoLabel(p)}
                onClick={() => onPick(p)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(UNSPLASH_DND_TYPE, JSON.stringify(p));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                style={{ backgroundColor: p.color ?? undefined }}
                className={cn(
                  "group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.06]",
                  "transition-[translate,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-flame/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40",
                )}
              >
                <img
                  src={p.smallUrl}
                  alt={photoLabel(p)}
                  crossOrigin="anonymous"
                  draggable={false}
                  loading="lazy"
                  className="size-full select-none object-cover opacity-[0.85] transition-opacity duration-200 ease-out group-hover:opacity-100"
                />
              </button>
              <Attribution photo={p} />
            </div>
          ))
        )}
      </div>

      {/* States */}
      {idle && (
        <p className="mt-4 text-center text-xs text-linen/40">
          Search Unsplash for a photo to start from.
        </p>
      )}
      {error && <p className="mt-4 text-center text-xs text-flame">{error}</p>}
      {!loading && !error && term && photos.length === 0 && (
        <p className="mt-4 text-center text-xs text-linen/45">
          No photos found for “{term}”. Try another search.
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-linen/45">
          <Sparkles className="size-3.5 text-linen/35" strokeWidth={1.8} />
          Click a photo, or drag it into the canvas to import.
        </span>
        <a
          href={UNSPLASH_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-linen/30 transition-colors hover:text-linen/60"
        >
          Photos from Unsplash
        </a>
      </div>
    </section>
  );
}
