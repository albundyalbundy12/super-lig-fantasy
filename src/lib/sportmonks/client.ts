import "server-only";

/**
 * Server-only Sportmonks Football API V3 client (scaffold).
 *
 * Rules (docs/API_SYNC_PLAN.md, docs/CODING_AGENT_TASKS.md):
 * - The token is read from the server environment only.
 * - The token must never reach the frontend or be committed to the repo.
 * - All Sportmonks calls happen server-side.
 *
 * The concrete fetch functions (getFixtureById, getFixtureWithLineups, ...)
 * are implemented in Task 3. This scaffold only sets up safe token access
 * and base configuration.
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
