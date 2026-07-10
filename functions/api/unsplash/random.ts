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
/*  GET /api/unsplash/random?count=&orientation=                       */
/*                                                                     */
/*  Inspiration feed shown when the panel first opens. Same server-    */
/*  side proxy pattern as search — the Client-ID never reaches the     */
/*  browser and only the public fields are returned.                   */
/* ------------------------------------------------------------------ */

const DEFAULT_COUNT = 12;
const MAX_COUNT = 20;
const ORIENTATIONS = new Set(["landscape", "portrait", "squarish"]);

export async function onRequestGet(ctx: PagesContext): Promise<Response> {
  const key = requireKey(ctx.env);
  if (key instanceof Response) return key;

  const url = new URL(ctx.request.url);
  const count = Math.min(
    intParam(url.searchParams.get("count"), DEFAULT_COUNT),
    MAX_COUNT,
  );
  const orientation = url.searchParams.get("orientation");

  const upstream = new URL(`${UNSPLASH_API}/photos/random`);
  upstream.searchParams.set("count", String(count));
  if (orientation && ORIENTATIONS.has(orientation)) {
    upstream.searchParams.set("orientation", orientation);
  }

  let res: Response;
  try {
    res = await fetch(upstream.toString(), { headers: unsplashHeaders(key) });
  } catch {
    return json({ error: "Could not reach the stock image service." }, 502);
  }
  if (!res.ok) return upstreamError(res.status);

  // With a count param Unsplash returns an array; guard just in case.
  const data = (await res.json()) as RawPhoto[] | RawPhoto;
  const list = Array.isArray(data) ? data : [data];
  return json({ results: list.map(pickPhoto) });
}
