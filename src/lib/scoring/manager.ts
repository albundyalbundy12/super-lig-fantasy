import "server-only";

import { prisma } from "@/lib/db";
import { DEFAULT_START_BUDGET, TEST_MANAGER } from "@/config/constants";
import { EMPTY_SLOT_POINTS } from "./rules";

/**
 * Simulated manager-scoring flow (Task 6).
 *
 * Proves the end-to-end chain "real player points -> manager round score"
 * without any user-facing auth, league UI or transfer market. It builds a
 * deterministic test manager (user, league, team, squad, lineup) from the
 * config in src/config/constants.ts using real players from fixture 18903623,
 * then derives the manager's round score from the player_match_scores that
 * Task 5 already calculated. No Sportmonks calls happen here.
 *
 * Scoring rules applied (MVP_BUILD_PLAN.md §3, §10):
 * - A lineup slot's points = the player's player_match_scores.points_total for
 *   the round (0 if the player has no score / did not play).
 * - An empty lineup slot scores EMPTY_SLOT_POINTS (-4).
 * - Squad players that are NOT in the lineup (the bench) score 0, regardless of
 *   how many real points they earned.
 * - manager_round_score.points_total = sum of lineup player points + empty-slot
 *   penalties.
 *
 * Idempotency: users / leagues / members / teams / lineups / round scores are
 * upserted on their unique keys; lineup slots are upserted on
 * @@unique([managerLineupId, slotIndex]); the squad (no unique key in the
 * schema) is rebuilt from scratch each run. Running the flow twice therefore
 * produces no duplicate round scores or lineup slots.
 *
 * Schema note: the schema has no per-slot points column, so slot-level point
 * explanations are not persisted. They are returned in the result for display;
 * the persisted breakdown lives in manager_round_scores (lineup vs empty-slot
 * vs total).
 */

export type ManagerSlotResult = {
  slotIndex: number;
  slotPosition: string;
  playerId: number | null;
  playerName: string | null;
  isEmpty: boolean;
  points: number;
};

export type ManagerBenchResult = {
  playerId: number;
  playerName: string | null;
  matchPoints: number;
  countedPoints: number;
};

export type ScoreTestManagerResult = {
  status: "success" | "failed";
  sportmonksFixtureId: number;
  scoringRunId: number;
  managerTeamId?: number;
  roundId?: number;
  pointsLineup: number;
  pointsEmptySlots: number;
  pointsTotal: number;
  slots: ManagerSlotResult[];
  bench: ManagerBenchResult[];
  errorMessage: string | null;
};

export async function scoreTestManager(
  sportmonksFixtureId: number,
): Promise<ScoreTestManagerResult> {
  const startedAt = new Date();

  const fixture = await prisma.fixture.findUnique({
    where: { sportmonksFixtureId },
    select: { id: true, seasonId: true, roundId: true, leagueId: true },
  });

  if (!fixture) {
    const run = await prisma.scoringRun.create({
      data: {
        status: "failed",
        startedAt,
        finishedAt: new Date(),
        errorMessage: `Fixture ${sportmonksFixtureId} not found. Run the fixture sync first.`,
      },
    });
    return emptyFailure(sportmonksFixtureId, run.id, run.errorMessage);
  }

  if (fixture.seasonId === null || fixture.roundId === null) {
    const run = await prisma.scoringRun.create({
      data: {
        fixtureId: fixture.id,
        status: "failed",
        startedAt,
        finishedAt: new Date(),
        errorMessage: `Fixture ${sportmonksFixtureId} has no season/round; cannot build a manager round score.`,
      },
    });
    return emptyFailure(sportmonksFixtureId, run.id, run.errorMessage);
  }

  const run = await prisma.scoringRun.create({
    data: { fixtureId: fixture.id, status: "running", startedAt },
  });

  try {
    const result = await buildAndScore({
      sportmonksFixtureId,
      scoringRunId: run.id,
      sportmonksSeasonId: fixture.seasonId,
      sportmonksRoundId: fixture.roundId,
      leagueId: fixture.leagueId ?? undefined,
    });

    await prisma.scoringRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        roundId: result.roundId,
        managersScored: 1,
      },
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.scoringRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });
    return emptyFailure(sportmonksFixtureId, run.id, message);
  }
}

function emptyFailure(
  sportmonksFixtureId: number,
  scoringRunId: number,
  errorMessage: string | null,
): ScoreTestManagerResult {
  return {
    status: "failed",
    sportmonksFixtureId,
    scoringRunId,
    pointsLineup: 0,
    pointsEmptySlots: 0,
    pointsTotal: 0,
    slots: [],
    bench: [],
    errorMessage,
  };
}

async function buildAndScore(args: {
  sportmonksFixtureId: number;
  scoringRunId: number;
  sportmonksSeasonId: number;
  sportmonksRoundId: number;
  leagueId?: number;
}): Promise<ScoreTestManagerResult> {
  const {
    sportmonksFixtureId,
    scoringRunId,
    sportmonksSeasonId,
    sportmonksRoundId,
    leagueId,
  } = args;

  // --- Ensure a Season + Round exist (FK targets for lineup/round score) -----
  const season = await prisma.season.upsert({
    where: { sportmonksSeasonId },
    create: {
      sportmonksSeasonId,
      leagueId: leagueId ?? sportmonksSeasonId,
    },
    update: {},
    select: { id: true },
  });

  const round = await prisma.round.upsert({
    where: { sportmonksRoundId },
    create: { sportmonksRoundId, seasonId: season.id },
    update: {},
    select: { id: true, sportmonksRoundId: true },
  });

  // --- Resolve the internal players referenced by the test squad/lineup ------
  const lineupSportmonksIds: number[] = TEST_MANAGER.slots
    .map((s) => s.sportmonksPlayerId)
    .filter((id) => id !== null) as number[];
  const benchSportmonksIds: number[] = [
    ...TEST_MANAGER.benchSportmonksPlayerIds,
  ];
  const allSportmonksIds = [
    ...new Set([...lineupSportmonksIds, ...benchSportmonksIds]),
  ];

  const players = await prisma.player.findMany({
    where: { sportmonksPlayerId: { in: allSportmonksIds } },
    select: { id: true, sportmonksPlayerId: true, name: true },
  });
  const playerBySportmonksId = new Map(
    players.map((p) => [p.sportmonksPlayerId, p]),
  );

  const missing = allSportmonksIds.filter(
    (id) => !playerBySportmonksId.has(id),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing players for sportmonks ids [${missing.join(", ")}]. ` +
        `Run the fixture sync + player scoring for fixture ${sportmonksFixtureId} first.`,
    );
  }

  // --- Per-player round points from player_match_scores (Task 5 output) ------
  const fixturesInRound = await prisma.fixture.findMany({
    where: { roundId: round.sportmonksRoundId },
    select: { id: true },
  });
  const matchScores = await prisma.playerMatchScore.findMany({
    where: { fixtureId: { in: fixturesInRound.map((f) => f.id) } },
    select: { playerId: true, pointsTotal: true },
  });
  const pointsByPlayerId = new Map<number, number>();
  for (const ms of matchScores) {
    pointsByPlayerId.set(
      ms.playerId,
      (pointsByPlayerId.get(ms.playerId) ?? 0) + ms.pointsTotal,
    );
  }

  // --- Upsert the test user / league / membership / team --------------------
  const user = await prisma.user.upsert({
    where: { email: TEST_MANAGER.userEmail },
    create: { email: TEST_MANAGER.userEmail, name: TEST_MANAGER.userName },
    update: {},
    select: { id: true },
  });

  const league = await prisma.fantasyLeague.upsert({
    where: { inviteCode: TEST_MANAGER.leagueInviteCode },
    create: {
      name: TEST_MANAGER.leagueName,
      inviteCode: TEST_MANAGER.leagueInviteCode,
      ownerUserId: user.id,
      seasonId: season.id,
    },
    update: { seasonId: season.id },
    select: { id: true },
  });

  await prisma.fantasyLeagueMember.upsert({
    where: {
      fantasyLeagueId_userId: { fantasyLeagueId: league.id, userId: user.id },
    },
    create: {
      fantasyLeagueId: league.id,
      userId: user.id,
      role: "owner",
    },
    update: {},
  });

  const team = await prisma.managerTeam.upsert({
    where: {
      fantasyLeagueId_userId: { fantasyLeagueId: league.id, userId: user.id },
    },
    create: {
      fantasyLeagueId: league.id,
      userId: user.id,
      name: TEST_MANAGER.teamName,
      budget: DEFAULT_START_BUDGET,
    },
    update: {},
    select: { id: true },
  });

  // --- Rebuild the squad (no unique key in schema -> delete + recreate) ------
  const squadPlayerIds = [
    ...lineupSportmonksIds,
    ...benchSportmonksIds,
  ].map((sm) => playerBySportmonksId.get(sm)!.id);

  await prisma.managerSquadPlayer.deleteMany({
    where: { managerTeamId: team.id },
  });
  await prisma.managerSquadPlayer.createMany({
    data: squadPlayerIds.map((playerId) => ({
      managerTeamId: team.id,
      playerId,
      acquiredVia: "test_seed",
    })),
  });

  // --- Upsert the lineup + its slots ----------------------------------------
  const lineup = await prisma.managerLineup.upsert({
    where: {
      managerTeamId_roundId: { managerTeamId: team.id, roundId: round.id },
    },
    create: {
      managerTeamId: team.id,
      roundId: round.id,
      formation: TEST_MANAGER.formation,
      status: "locked",
      lockedAt: new Date(),
    },
    update: { formation: TEST_MANAGER.formation },
    select: { id: true },
  });

  const slots: ManagerSlotResult[] = [];
  let pointsLineup = 0;
  let emptySlotCount = 0;

  for (const slot of TEST_MANAGER.slots) {
    const internalPlayer =
      slot.sportmonksPlayerId === null
        ? null
        : playerBySportmonksId.get(slot.sportmonksPlayerId)!;
    const isEmpty = internalPlayer === null;

    let points: number;
    if (isEmpty) {
      points = EMPTY_SLOT_POINTS;
      emptySlotCount += 1;
    } else {
      points = pointsByPlayerId.get(internalPlayer.id) ?? 0;
      pointsLineup += points;
    }

    await prisma.managerLineupSlot.upsert({
      where: {
        managerLineupId_slotIndex: {
          managerLineupId: lineup.id,
          slotIndex: slot.slotIndex,
        },
      },
      create: {
        managerLineupId: lineup.id,
        slotIndex: slot.slotIndex,
        slotPosition: slot.slotPosition,
        playerId: internalPlayer?.id ?? null,
        isEmpty,
      },
      update: {
        slotPosition: slot.slotPosition,
        playerId: internalPlayer?.id ?? null,
        isEmpty,
      },
    });

    slots.push({
      slotIndex: slot.slotIndex,
      slotPosition: slot.slotPosition,
      playerId: internalPlayer?.id ?? null,
      playerName: internalPlayer?.name ?? null,
      isEmpty,
      points,
    });
  }

  const pointsEmptySlots = emptySlotCount * EMPTY_SLOT_POINTS;
  const pointsTotal = pointsLineup + pointsEmptySlots;

  // --- Bench players: in the squad, never in the lineup -> always 0 ----------
  const bench: ManagerBenchResult[] = benchSportmonksIds.map((sm) => {
    const p = playerBySportmonksId.get(sm)!;
    return {
      playerId: p.id,
      playerName: p.name,
      matchPoints: pointsByPlayerId.get(p.id) ?? 0,
      countedPoints: 0,
    };
  });

  // --- Persist the manager round score --------------------------------------
  await prisma.managerRoundScore.upsert({
    where: {
      managerTeamId_roundId: { managerTeamId: team.id, roundId: round.id },
    },
    create: {
      managerTeamId: team.id,
      roundId: round.id,
      pointsLineup,
      pointsEmptySlots,
      pointsTotal,
      calculatedAt: new Date(),
    },
    update: {
      pointsLineup,
      pointsEmptySlots,
      pointsTotal,
      calculatedAt: new Date(),
    },
  });

  // Keep the team's running total in sync (sum across all its rounds).
  const totals = await prisma.managerRoundScore.aggregate({
    where: { managerTeamId: team.id },
    _sum: { pointsTotal: true },
  });
  await prisma.managerTeam.update({
    where: { id: team.id },
    data: { pointsTotal: totals._sum.pointsTotal ?? pointsTotal },
  });

  return {
    status: "success",
    sportmonksFixtureId,
    scoringRunId,
    managerTeamId: team.id,
    roundId: round.id,
    pointsLineup,
    pointsEmptySlots,
    pointsTotal,
    slots,
    bench,
    errorMessage: null,
  };
}
