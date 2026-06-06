import "server-only";

import { prisma } from "@/lib/db";

/**
 * Read-only queries for the Turkish user-facing pages (Task 8).
 *
 * Everything is derived from data already stored by earlier tasks (the synced
 * fixture, the calculated player_match_scores and the Task 6 test manager). No
 * Sportmonks calls happen here.
 *
 * Fixture <-> round bridge: fixtures store the RAW Sportmonks round id, not a
 * relation to the internal rounds table, so we match fixture.roundId against
 * round.sportmonksRoundId.
 */

async function fixtureIdsForRound(internalRoundId: number): Promise<number[]> {
  const round = await prisma.round.findUnique({
    where: { id: internalRoundId },
    select: { sportmonksRoundId: true },
  });
  if (!round) return [];
  const fixtures = await prisma.fixture.findMany({
    where: { roundId: round.sportmonksRoundId },
    select: { id: true },
  });
  return fixtures.map((f) => f.id);
}

export type PlayerScore = Awaited<
  ReturnType<typeof prisma.playerMatchScore.findMany>
>[number];

/**
 * The latest test manager's round, with its lineup slots and a per-player score
 * map. Powers the dashboard, lineup and points pages.
 */
export async function getManagerRoundDetail() {
  const roundScore = await prisma.managerRoundScore.findFirst({
    orderBy: { id: "desc" },
    include: { managerTeam: { include: { league: true } } },
  });
  if (!roundScore) return null;

  const lineup = await prisma.managerLineup.findUnique({
    where: {
      managerTeamId_roundId: {
        managerTeamId: roundScore.managerTeamId,
        roundId: roundScore.roundId,
      },
    },
    include: {
      slots: { orderBy: { slotIndex: "asc" }, include: { player: true } },
    },
  });

  const fixtureIds = await fixtureIdsForRound(roundScore.roundId);
  const scores = await prisma.playerMatchScore.findMany({
    where: { fixtureId: { in: fixtureIds } },
    include: { player: true },
  });
  const scoreByPlayerId = new Map(scores.map((s) => [s.playerId, s]));

  return { roundScore, lineup, scoreByPlayerId };
}

/** The test manager's squad, with each player's points for the latest round. */
export async function getManagerSquad() {
  const team = await prisma.managerTeam.findFirst({ orderBy: { id: "asc" } });
  if (!team) return null;

  const squad = await prisma.managerSquadPlayer.findMany({
    where: { managerTeamId: team.id },
    include: { player: true },
    orderBy: { playerId: "asc" },
  });

  const latestRound = await prisma.managerRoundScore.findFirst({
    where: { managerTeamId: team.id },
    orderBy: { id: "desc" },
    select: { roundId: true },
  });

  const pointsByPlayerId = new Map<number, number>();
  if (latestRound) {
    const fixtureIds = await fixtureIdsForRound(latestRound.roundId);
    const scores = await prisma.playerMatchScore.findMany({
      where: { fixtureId: { in: fixtureIds } },
      select: { playerId: true, pointsTotal: true },
    });
    for (const s of scores) {
      pointsByPlayerId.set(
        s.playerId,
        (pointsByPlayerId.get(s.playerId) ?? 0) + s.pointsTotal,
      );
    }
  }

  return { team, squad, pointsByPlayerId };
}

/** Simple league table from manager_round_scores, ranked by total points. */
export async function getLeagueTable() {
  const teams = await prisma.managerTeam.findMany({
    include: {
      roundScores: { orderBy: { roundId: "desc" } },
      user: { select: { name: true, email: true } },
    },
  });

  const rows = teams.map((team) => {
    const roundPoints =
      team.roundScores.length > 0 ? team.roundScores[0].pointsTotal : 0;
    return {
      teamId: team.id,
      teamName: team.name,
      managerName: team.user.name ?? team.user.email,
      roundPoints,
      pointsTotal: team.pointsTotal,
      squadValue: team.squadValue,
      budget: team.budget,
    };
  });

  rows.sort((a, b) => b.pointsTotal - a.pointsTotal);
  return rows;
}
