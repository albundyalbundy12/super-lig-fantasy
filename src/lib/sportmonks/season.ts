import "server-only";

import { sportmonksGet } from "./client";
import type { SportmonksFixture } from "./fixtures";

/**
 * Server-only fetchers for current-season data (Task 12).
 *
 * Tested working endpoints (see docs/API_TEST_RESULTS.md §13):
 * - GET /v3/football/seasons/{id}                  → season detail
 * - GET /v3/football/rounds/seasons/{id}           → all rounds of a season
 * - GET /v3/football/seasons/{id}?include=fixtures → all fixtures of a season
 *
 * NOTE: GET /v3/football/fixtures/seasons/{id} does NOT exist (404). Fixtures
 * for a whole season are read via the season `include=fixtures`.
 *
 * These functions only fetch and return raw Sportmonks data. Persisting them is
 * handled by src/lib/sync/season.ts.
 */

export type SportmonksSeason = {
  id: number;
  sport_id?: number;
  league_id?: number;
  name?: string | null;
  finished?: boolean;
  pending?: boolean;
  is_current?: boolean;
  starting_at?: string | null;
  ending_at?: string | null;
  fixtures?: SportmonksFixture[];
  [key: string]: unknown;
};

export type SportmonksRound = {
  id: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number;
  name?: string | null;
  finished?: boolean;
  is_current?: boolean;
  starting_at?: string | null;
  ending_at?: string | null;
  fixtures?: SportmonksFixture[];
  [key: string]: unknown;
};

/**
 * GET /v3/football/seasons/{id}
 * Season detail (name, is_current, starting_at, ending_at, league_id).
 */
export function getSeason(seasonId: number): Promise<SportmonksSeason> {
  return sportmonksGet<SportmonksSeason>(`/seasons/${seasonId}`);
}

/**
 * GET /v3/football/rounds/seasons/{id}
 * All rounds (match days) for a season, as an array.
 */
export function getRoundsBySeason(
  seasonId: number,
): Promise<SportmonksRound[]> {
  return sportmonksGet<SportmonksRound[]>(`/rounds/seasons/${seasonId}`);
}

/**
 * GET /v3/football/seasons/{id}?include=fixtures
 * All fixtures of a season. Each fixture carries round_id and starting_at,
 * which lets us compute the per-round lock time downstream.
 */
export async function getFixturesBySeason(
  seasonId: number,
): Promise<SportmonksFixture[]> {
  const season = await sportmonksGet<SportmonksSeason>(`/seasons/${seasonId}`, {
    include: "fixtures",
  });
  return season.fixtures ?? [];
}
