import {
  json,
  requireKey,
  unsplashHeaders,
  upstreamError,
  UNSPLASH_API,
  type PagesContext,
} from "../../types";

/* ------------------------------------------------------------------ */
/*  GET /api/unsplash/search?q=&page=&perPage=                         */
/*                                                                     */
/*  Same-origin proxy for Unsplash search. The Client-ID lives only in */
/*  the Pages environment; the browser never sees it. Responses are    */
/*  narrowed to the fields the panel renders, so nothing extra leaks.  */
/* ------------------------------------------------------------------ */

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 20;

export interface SearchPhoto {
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

interface RawPhoto extends SearchPhoto {
  urls: { small: string; regular: string; full?: string; raw?: string };
}

/** Positive integer from a query param, or the fallback. */
function intParam(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

function pick(p: RawPhoto): SearchPhoto {
  return {
    id: p.id,
    width: p.width,
    height: p.height,
    description: p.description ?? null,
    alt_description: p.alt_description ?? null,
    color: p.color ?? null,
    urls: { small: p.urls.small, regular: p.urls.regular },
    links: { html: p.links.html },
    user: {
      name: p.user.name,
      username: p.user.username,
      links: { html: p.user.links.html },
    },
  };
}

export async function onRequestGet(ctx: PagesContext): Promise<Response> {
  const key = requireKey(ctx.env);
  if (key instanceof Response) return key;

  const url = new URL(ctx.request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return json({ error: "A search term is required." }, 400);

  const page = intParam(url.searchParams.get("page"), 1);
  const perPage = Math.min(
    intParam(url.searchParams.get("perPage"), DEFAULT_PER_PAGE),
    MAX_PER_PAGE,
  );

  const upstream = new URL(`${UNSPLASH_API}/search/photos`);
  upstream.searchParams.set("query", q);
  upstream.searchParams.set("page", String(page));
  upstream.searchParams.set("per_page", String(perPage));

  let res: Response;
  try {
    res = await fetch(upstream.toString(), { headers: unsplashHeaders(key) });
  } catch {
    return json({ error: "Could not reach the stock image service." }, 502);
  }
  if (!res.ok) return upstreamError(res.status);

  const data = (await res.json()) as { total: number; results: RawPhoto[] };
  return json({ total: data.total, results: data.results.map(pick) });
}
