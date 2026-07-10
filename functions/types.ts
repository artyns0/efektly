/* ------------------------------------------------------------------ */
/*  Minimal Cloudflare Pages Functions typings.                        */
/*  Declared locally so the project does not need @cloudflare/workers- */
/*  types just for two small proxy routes.                             */
/* ------------------------------------------------------------------ */

export interface Env {
  /** Unsplash Client-ID. Server-side only — never sent to the browser. */
  UNSPLASH_ACCESS_KEY?: string;
}

export interface PagesContext {
  request: Request;
  env: Env;
}

export const UNSPLASH_API = "https://api.unsplash.com";

/** JSON helper with caching disabled — responses are per-request. */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * The key is optional at the type level because a misconfigured deploy must
 * fail as a sanitized 503 rather than crash and leak environment details.
 */
export function requireKey(env: Env): string | Response {
  const key = env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return json({ error: "Stock image search is unavailable." }, 503);
  }
  return key;
}

/** Maps Unsplash status codes onto messages that are safe to show a user. */
export function upstreamError(status: number): Response {
  if (status === 401 || status === 403) {
    // 403 from Unsplash is nearly always the hourly rate limit.
    return json(
      { error: "Stock image search is temporarily unavailable." },
      status === 403 ? 429 : 502,
    );
  }
  return json({ error: "Could not reach the stock image service." }, 502);
}

export function unsplashHeaders(key: string): HeadersInit {
  return {
    Authorization: `Client-ID ${key}`,
    "Accept-Version": "v1",
  };
}
