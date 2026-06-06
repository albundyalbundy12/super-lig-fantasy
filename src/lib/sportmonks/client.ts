import "server-only";

/**
 * Server-only Sportmonks Football API V3 client core.
 *
 * Rules (docs/API_SYNC_PLAN.md §17, docs/CODING_AGENT_TASKS.md §2):
 * - The token is read from the server environment only.
 * - The token must never reach the frontend or be committed to the repo.
 * - All Sportmonks calls happen server-side.
 *
 * This module only does authenticated GET requests against the V3 fixtures
 * endpoints and surfaces errors + rate-limit metadata. It does NOT touch the
 * database (Task 4) and does NOT compute scores (Task 5+).
 */

export const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";

/**
 * Reads the Sportmonks API token from the server environment.
 * Returns null if it is not configured, so callers can fail gracefully
 * instead of crashing the app.
 */
export function getSportmonksToken(): string | null {
  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token || token.trim() === "") {
    return null;
  }
  return token;
}

/**
 * Whether the Sportmonks client is ready to make authenticated calls.
 * Safe to surface to the UI — it never exposes the token itself.
 */
export function isSportmonksConfigured(): boolean {
  return getSportmonksToken() !== null;
}

/**
 * Error thrown for any failed Sportmonks request. Carries the HTTP status (if
 * any) so callers can distinguish auth / not-found / rate-limit problems.
 * The token is never included in the message.
 */
export class SportmonksError extends Error {
  readonly status?: number;
  readonly endpoint?: string;

  constructor(
    message: string,
    options?: { status?: number; endpoint?: string; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "SportmonksError";
    this.status = options?.status;
    this.endpoint = options?.endpoint;
  }
}

/**
 * Rate-limit metadata as returned by Sportmonks V3 in the response body.
 * See https://docs.sportmonks.com — every V3 response carries `rate_limit`.
 */
export type SportmonksRateLimit = {
  resets_in_seconds?: number;
  remaining?: number;
  requested_entity?: string;
};

/**
 * Shape of a Sportmonks V3 response envelope. `data` is the actual payload;
 * the rest is metadata. We keep `data` generic per endpoint.
 */
export type SportmonksResponse<T> = {
  data: T;
  rate_limit?: SportmonksRateLimit;
  subscription?: unknown;
  message?: string;
};

type FetchOptions = {
  /** Sportmonks `include=` value, e.g. "participants" or "lineups.details". */
  include?: string;
  /** Extra query params (besides the token + include). */
  query?: Record<string, string | number>;
};

/**
 * Logs rate-limit metadata when present. Helps us watch the trial plan's
 * remaining quota (docs/API_SYNC_PLAN.md §9). Never logs the token.
 */
function logRateLimit(endpoint: string, rateLimit?: SportmonksRateLimit): void {
  if (!rateLimit) return;
  const { remaining, resets_in_seconds, requested_entity } = rateLimit;
  console.info(
    `[sportmonks] rate_limit endpoint=${endpoint} entity=${
      requested_entity ?? "?"
    } remaining=${remaining ?? "?"} resets_in_seconds=${
      resets_in_seconds ?? "?"
    }`,
  );
}

/**
 * Core authenticated GET against the Sportmonks V3 football API.
 *
 * Auth uses the `Authorization` header (not a query param) so the token never
 * lands in request URLs, logs, or referrers. Returns the parsed `data` field.
 */
export async function sportmonksGet<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = getSportmonksToken();
  if (!token) {
    throw new SportmonksError(
      "SPORTMONKS_API_TOKEN is not configured on the server.",
      { endpoint: path },
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${SPORTMONKS_BASE_URL}${normalizedPath}`);
  if (options.include) {
    url.searchParams.set("include", options.include);
  }
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(key, String(value));
    }
  }

  // The path (without token) is safe to use in logs/errors.
  const endpoint = `${normalizedPath}${
    options.include ? `?include=${options.include}` : ""
  }`;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
      // Always hit the live API; caching/DB persistence is Task 4.
      cache: "no-store",
    });
  } catch (cause) {
    throw new SportmonksError(
      `Network error while requesting ${endpoint}.`,
      { endpoint, cause },
    );
  }

  let body: SportmonksResponse<T> | undefined;
  try {
    body = (await response.json()) as SportmonksResponse<T>;
  } catch {
    body = undefined;
  }

  logRateLimit(endpoint, body?.rate_limit);

  if (!response.ok) {
    const apiMessage = body?.message ?? response.statusText;
    throw new SportmonksError(
      `Sportmonks request failed (${response.status}) for ${endpoint}: ${apiMessage}`,
      { status: response.status, endpoint },
    );
  }

  if (!body || body.data === undefined) {
    throw new SportmonksError(
      `Sportmonks returned no data for ${endpoint}.`,
      { status: response.status, endpoint },
    );
  }

  return body.data;
}
