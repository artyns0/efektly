import {
  json,
  requireKey,
  unsplashHeaders,
  upstreamError,
  UNSPLASH_API,
  type PagesContext,
} from "../../types";

/* ------------------------------------------------------------------ */
/*  POST /api/unsplash/download  { photoId }                           */
/*                                                                     */
/*  Unsplash's API guidelines require a download ping whenever a photo */
/*  is actually used. The endpoint is rebuilt from a validated id — no */
/*  caller-supplied URL is ever fetched, so this cannot be used as an  */
/*  SSRF gadget.                                                       */
/* ------------------------------------------------------------------ */

/** Unsplash photo ids are short base62-ish slugs. */
const PHOTO_ID = /^[A-Za-z0-9_-]{5,32}$/;

export async function onRequestPost(ctx: PagesContext): Promise<Response> {
  const key = requireKey(ctx.env);
  if (key instanceof Response) return key;

  let photoId: unknown;
  try {
    ({ photoId } = (await ctx.request.json()) as { photoId?: unknown });
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (typeof photoId !== "string" || !PHOTO_ID.test(photoId)) {
    return json({ error: "Invalid photo id." }, 400);
  }

  let res: Response;
  try {
    res = await fetch(
      `${UNSPLASH_API}/photos/${encodeURIComponent(photoId)}/download`,
      { headers: unsplashHeaders(key) },
    );
  } catch {
    return json({ error: "Could not reach the stock image service." }, 502);
  }
  if (!res.ok) return upstreamError(res.status);

  return json({ ok: true });
}
