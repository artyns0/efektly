import {
  json,
  intParam,
  pickPhoto,
  requireKey,
  unsplashHeaders,
  upstreamError,
  UNSPLASH_API,
  type PagesContext,
  type RawPhoto,
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
  return json({ total: data.total, results: data.results.map(pickPhoto) });
}
