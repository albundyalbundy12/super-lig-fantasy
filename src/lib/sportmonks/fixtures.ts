import "server-only";

import { sportmonksGet } from "./client";

/**
 * Server-only fetchers for a single Sportmonks fixture (Task 3).
 *
 * Endpoint: GET /v3/football/fixtures/{id} with the relevant `include=`.
 * Includes follow docs/API_SYNC_PLAN.md §7 and docs/API_TEST_RESULTS.md.
 *
 * These functions ONLY fetch and return raw Sportmonks data. They do not write
 * to the database (Task 4) and do not compute scores (Task 5+). Types below are
 * intentionally light — the raw shape is mapped during sync.
 */

export type SportmonksFixture = {
  id: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number;
  round_id?: number;
  state_id?: number;
  venue_id?: number;
  name?: string;
  starting_at?: string;
  starting_at_timestamp?: number;
  result_info?: string | null;
  length?: number;
  [key: string]: unknown;
};

export type SportmonksParticipant = {
  id: number;
  name?: string;
  short_code?: string | null;
  image_path?: string | null;
  meta?: {
    location?: "home" | "away";
    winner?: boolean | null;
    position?: number | null;
  };
  [key: string]: unknown;
};

export type SportmonksEvent = {
  id: number;
  fixture_id?: number;
  participant_id?: number | null;
  player_id?: number | null;
  related_player_id?: number | null;
  type_id?: number;
  minute?: number | null;
  extra_minute?: number | null;
  result?: string | null;
  info?: string | null;
  addition?: string | null;
  [key: string]: unknown;
};

export type SportmonksLineupDetail = {
  id: number;
  fixture_id?: number;
  player_id?: number | null;
  team_id?: number | null;
  lineup_id?: number | null;
  type_id?: number;
  data?: { value?: number | string | null };
  [key: string]: unknown;
};

export type SportmonksLineup = {
  id: number;
  fixture_id?: number;
  player_id?: number | null;
  team_id?: number | null;
  position_id?: number | null;
  formation_field?: string | null;
  formation_position?: number | null;
  type_id?: number;
  player_name?: string | null;
  jersey_number?: number | null;
  details?: SportmonksLineupDetail[];
  [key: string]: unknown;
};

export type FixtureWithParticipants = SportmonksFixture & {
  participants?: SportmonksParticipant[];
};

export type FixtureWithEvents = SportmonksFixture & {
  events?: SportmonksEvent[];
};

export type FixtureWithLineups = SportmonksFixture & {
  lineups?: SportmonksLineup[];
};

/**
 * GET /v3/football/fixtures/{id}
 * Base fixture detail with no includes.
 */
export function getFixtureById(fixtureId: number): Promise<SportmonksFixture> {
  return sportmonksGet<SportmonksFixture>(`/fixtures/${fixtureId}`);
}

/**
 * GET /v3/football/fixtures/{id}?include=participants
 * Fixture with the two participating teams (home/away, winner, position).
 */
export function getFixtureWithParticipants(
  fixtureId: number,
): Promise<FixtureWithParticipants> {
  return sportmonksGet<FixtureWithParticipants>(`/fixtures/${fixtureId}`, {
    include: "participants",
  });
}

/**
 * GET /v3/football/fixtures/{id}?include=events
 * Fixture with match events (goals, cards, substitutions, ...).
 */
export function getFixtureWithEvents(
  fixtureId: number,
): Promise<FixtureWithEvents> {
  return sportmonksGet<FixtureWithEvents>(`/fixtures/${fixtureId}`, {
    include: "events",
  });
}

/**
 * GET /v3/football/fixtures/{id}?include=lineups
 * Fixture with starting XI + bench (type_id 11 = start, 12 = bench).
 */
export function getFixtureWithLineups(
  fixtureId: number,
): Promise<FixtureWithLineups> {
  return sportmonksGet<FixtureWithLineups>(`/fixtures/${fixtureId}`, {
    include: "lineups",
  });
}

/**
 * GET /v3/football/fixtures/{id}?include=lineups.details
 * Fixture with per-player lineup details — the key include for scoring
 * (type_id 118 = rating, 119 = minutes). See docs/API_TEST_RESULTS.md §4.6.
 */
export function getFixtureWithLineupDetails(
  fixtureId: number,
): Promise<FixtureWithLineups> {
  return sportmonksGet<FixtureWithLineups>(`/fixtures/${fixtureId}`, {
    include: "lineups.details",
  });
}
