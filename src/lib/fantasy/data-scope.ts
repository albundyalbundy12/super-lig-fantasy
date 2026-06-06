import "server-only";

import { prisma } from "@/lib/db";
import { CURRENT_SEASON_ID, TEST_SEASON_ID } from "@/config/constants";

/**
 * Data-separation layer between the HISTORICAL test data and the CURRENT
 * Süper Lig season.
 *
 * Why this exists
 * ---------------
 * The database holds two completely different datasets that must never be
 * mixed:
 *
 *   1. Historical test data — season {@link TEST_SEASON_ID} (22057), the single
 *      Galatasaray vs Beşiktaş fixture (18903623). It exists only to prove the
 *      sync + scoring pipeline. Its 42 players, 2 teams and player_match_scores
 *      are test fixtures, NOT live game content.
 *
 *   2. Current season — season {@link CURRENT_SEASON_ID} (25682, 2025/2026).
 *      This is the real game world: 34 rounds + 306 fixtures are stored, but
 *      teams and player squads (kadro) are not synced yet.
 *
 * Every entity is already keyed by its Sportmonks season id (fixtures carry the
 * raw season_id; rounds link to the internal season row), so the two datasets
 * are separable with read-only queries — no schema change, no migration, and
 * the historical test data is never touched.
 *
 * Pure DB reads — no Sportmonks calls happen here.
 */

export type SeasonDataScope = {
  sportmonksSeasonId: number;
  exists: boolean;
  name: string | null;
  isCurrent: boolean;
  totalRounds: number;
  totalFixtures: number;
  /** Fixtures that have stored participants (i.e. home/away teams known). */
  fixturesWithParticipants: number;
  /** Distinct real teams known for this season (via fixture participants). */
  teamsAvailable: number;
  /** Distinct players known for this season (via fixture lineups). */
  playersAvailable: number;
};

async function fixtureIdsForSeason(sportmonksSeasonId: number): Promise<number[]> {
  const fixtures = await prisma.fixture.findMany({
    where: { seasonId: sportmonksSeasonId },
    select: { id: true },
  });
  return fixtures.map((f) => f.id);
}

/**
 * Summarises one season's stored data so the two datasets can be reported and
 * compared side by side. Works identically for the historical test season and
 * the current season.
 */
export async function getSeasonDataScope(
  sportmonksSeasonId: number,
): Promise<SeasonDataScope> {
  // Season metadata row is optional: fixtures (and everything counted from
  // them) are keyed by the raw Sportmonks season id, so the scope must still
  // report fixture/team/player counts even when no `seasons` row exists. Only
  // rounds and the name/isCurrent flags depend on the metadata row.
  const season = await prisma.season.findUnique({
    where: { sportmonksSeasonId },
    select: { id: true, name: true, isCurrent: true },
  });

  const totalRounds = season
    ? await prisma.round.count({ where: { seasonId: season.id } })
    : 0;

  const fixtureIds = await fixtureIdsForSeason(sportmonksSeasonId);

  const participants =
    fixtureIds.length > 0
      ? await prisma.fixtureParticipant.findMany({
          where: { fixtureId: { in: fixtureIds } },
          select: { fixtureId: true, teamId: true },
        })
      : [];
  const teamIds = new Set(participants.map((p) => p.teamId));
  const fixturesWithParticipants = new Set(
    participants.map((p) => p.fixtureId),
  ).size;

  const lineups =
    fixtureIds.length > 0
      ? await prisma.fixtureLineup.findMany({
          where: { fixtureId: { in: fixtureIds }, playerId: { not: null } },
          select: { playerId: true },
        })
      : [];
  const playerIds = new Set(
    lineups
      .map((l) => l.playerId)
      .filter((id): id is number => id !== null),
  );

  return {
    sportmonksSeasonId,
    exists: season !== null || fixtureIds.length > 0,
    name: season?.name ?? null,
    isCurrent: season?.isCurrent ?? false,
    totalRounds,
    totalFixtures: fixtureIds.length,
    fixturesWithParticipants,
    teamsAvailable: teamIds.size,
    playersAvailable: playerIds.size,
  };
}

/** Scope of the historical test dataset (season 22057). */
export function getHistoricalTestDataScope(): Promise<SeasonDataScope> {
  return getSeasonDataScope(TEST_SEASON_ID);
}

/** Scope of the current Süper Lig season dataset (season 25682). */
export function getCurrentSeasonDataScope(): Promise<SeasonDataScope> {
  return getSeasonDataScope(CURRENT_SEASON_ID);
}

export type CurrentSeasonReadiness = {
  seasonStored: boolean;
  roundsStored: boolean;
  fixturesStored: boolean;
  teamsAvailable: boolean;
  playersAvailable: boolean;
  /** True once teams AND players are present, i.e. squad sync can run. */
  squadSyncReady: boolean;
};

/**
 * Boolean readiness checklist for the current season, derived from the scope.
 * Drives the "what is still missing" display on the admin page and is the
 * single place that decides whether current-season squad/kadro features can be
 * enabled.
 */
export async function getCurrentSeasonReadiness(): Promise<CurrentSeasonReadiness> {
  const scope = await getCurrentSeasonDataScope();
  const teamsAvailable = scope.teamsAvailable > 0;
  const playersAvailable = scope.playersAvailable > 0;
  return {
    seasonStored: scope.exists,
    roundsStored: scope.totalRounds > 0,
    fixturesStored: scope.totalFixtures > 0,
    teamsAvailable,
    playersAvailable,
    squadSyncReady: teamsAvailable && playersAvailable,
  };
}

/**
 * The active player pool for the CURRENT season — the single source of truth
 * any current-season feature (squad draft, transfer market, scoring) must use
 * so it never accidentally pulls in the 42 historical test players.
 *
 * A player counts as current-season-active when they are `active` AND appear in
 * a stored lineup of a current-season fixture. Until the current-season squads
 * are synced this correctly returns an empty list, which is what keeps the
 * historical test players out of the live game.
 */
export async function getActiveCurrentSeasonPlayers() {
  const fixtureIds = await fixtureIdsForSeason(CURRENT_SEASON_ID);
  if (fixtureIds.length === 0) return [];

  const lineups = await prisma.fixtureLineup.findMany({
    where: { fixtureId: { in: fixtureIds }, playerId: { not: null } },
    select: { playerId: true },
  });
  const sportmonksPlayerIds = [
    ...new Set(
      lineups
        .map((l) => l.playerId)
        .filter((id): id is number => id !== null),
    ),
  ];
  if (sportmonksPlayerIds.length === 0) return [];

  return prisma.player.findMany({
    where: {
      sportmonksPlayerId: { in: sportmonksPlayerIds },
      status: "active",
    },
    orderBy: [{ positionId: "asc" }, { name: "asc" }],
  });
}
