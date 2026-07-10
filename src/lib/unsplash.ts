/* ------------------------------------------------------------------ */
/*  Unsplash client — talks only to Efektly's own same-origin proxy.   */
/*  The Access Key lives in the Pages Function environment and is      */
/*  never present in this bundle.                                      */
/* ------------------------------------------------------------------ */

export const UNSPLASH_UTM = "utm_source=efektly&utm_medium=referral";
export const UNSPLASH_HOME = `https://unsplash.com/?${UNSPLASH_UTM}`;

/** Appends the referral parameters Unsplash asks integrations to send. */
export function withUtm(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${UNSPLASH_UTM}`;
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description: string | null;
  altDescription: string | null;
  /** Dominant colour, used as the thumbnail placeholder tint. */
  color: string | null;
  /** Hotlinked thumbnail. */
  smallUrl: string;
  /** Hotlinked full-size image used as the active media source. */
  regularUrl: string;
  photoUrl: string;
  photographerName: string;
  photographerUsername: string;
  photographerUrl: string;
}

interface ApiPhoto {
  id: string;
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  color: string | null;
  urls: { small: string; regular: string };
  links: { html: string };
  user: { name: string; username: string; links: { html: string } };
}

function normalize(p: ApiPhoto): UnsplashPhoto {
  return {
    id: p.id,
    width: p.width,
    height: p.height,
    description: p.description,
    altDescription: p.alt_description,
    color: p.color,
    smallUrl: p.urls.small,
    regularUrl: p.urls.regular,
    photoUrl: p.links.html,
    photographerName: p.user.name,
    photographerUsername: p.user.username,
    photographerUrl: p.user.links.html,
  };
}

/** A readable label for alt text and titles. */
export function photoLabel(p: UnsplashPhoto): string {
  return p.altDescription ?? p.description ?? "Unsplash photo";
}

async function readError(res: Response): Promise<never> {
  let message = "Could not load stock images.";
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    /* keep the generic message */
  }
  if (res.status === 429) {
    message = "Too many searches right now. Try again in a minute.";
  }
  throw new Error(message);
}

export async function searchPhotos(
  query: string,
  perPage = 12,
  signal?: AbortSignal,
): Promise<UnsplashPhoto[]> {
  const params = new URLSearchParams({ q: query, perPage: String(perPage) });
  const res = await fetch(`/api/unsplash/search?${params}`, { signal });
  if (!res.ok) await readError(res);
  const data = (await res.json()) as { results: ApiPhoto[] };
  return data.results.map(normalize);
}

/**
 * Unsplash requires a download ping when a photo is actually used.
 * Best-effort: a failure here must never block the import.
 */
export async function trackDownload(photoId: string): Promise<void> {
  try {
    await fetch("/api/unsplash/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
  } catch {
    /* ignore — tracking is not worth failing an import over */
  }
}
