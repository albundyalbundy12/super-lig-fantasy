import "server-only";

import { prisma } from "@/lib/db";
import {
  ASSIST_POINTS,
  DETAIL_TYPE,
  EVENT_TYPE,
  cardPoints,
  goalPointsForPosition,
  minutesPoints,
  ratingPoints,
} from "./rules";

/**
 * Player match-score engine (Task 5).
 *
 * Reads already-synced raw data (fixture_lineups, fixture_lineup_details,
 * fixture_events) for one fixture and writes calculated fantasy points into
 * player_match_scores. No Sportmonks calls happen here — Task 5 works purely
 * off Task 4's synced data.
 *
 * Rules (docs/SCORING_RULES.md, docs/CODING_AGENT_TASKS.md §8):
 * - detail type_id 118 = rating, 119 = minutes (both provisional).
 * - event type_id 14 = goal, 16 = penalty goal (scored as a normal goal).
 * - event type_id 19 = yellow card, 20 = red card.
 * - related_player_id on a goal event credits that player with an assist.
 * - goal points depend on the player's position_id.
 *
 * Idempotency: player_match_scores is upserted on its @@unique([fixtureId,
 * playerId]); running scoring twice updates rows instead of duplicating them.
 * Each run is logged in scoring_runs.
 *
 * Schema note: player_match_scores.player_id is an FK to our internal players
 * table, but no task syncs players yet. We therefore derive minimal Player rows
 * from the synced lineup data (sportmonks id + name + position) so the scores
 * have something to reference. This uses already-synced data only.
 */

export type ScoreFixtureResult = {
  status: "success" | "failed";
  sportmonksFixtureId: number;
  fixtureId?: number;
  scoringRunId: number;
  playersScored: number;
  errorMessage: string | null;
};

export async function scoreFixturePlayers(
  sportmonksFixtureId: number,
): Promise<ScoreFixtureResult> {
  const startedAt = new Date();

  // Resolve the internal fixture first so the scoring_run can reference it.
  const fixture = await prisma.fixture.findUnique({
    where: { sportmonksFixtureId },
    select: { id: true },
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
    return {
      status: "failed",
      sportmonksFixtureId,
      scoringRunId: run.id,
      playersScored: 0,
      errorMessage: run.errorMessage,
    };
  }

  const run = await prisma.scoringRun.create({
    data: { fixtureId: fixture.id, status: "running", startedAt },
  });

  try {
    const playersScored = await computeAndStore(fixture.id);

    await prisma.scoringRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        playersScored,
      },
    });

    return {
      status: "success",
      sportmonksFixtureId,
      fixtureId: fixture.id,
      scoringRunId: run.id,
      playersScored,
      errorMessage: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.scoringRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });
    return {
      status: "failed",
      sportmonksFixtureId,
      fixtureId: fixture.id,
      scoringRunId: run.id,
      playersScored: 0,
      errorMessage: message,
    };
  }
}

/** Reads raw data, computes points and upserts player_match_scores. */
async function computeAndStore(internalFixtureId: number): Promise<number> {
  const [lineups, details, events] = await Promise.all([
    prisma.fixtureLineup.findMany({
      where: { fixtureId: internalFixtureId },
      select: {
        playerId: true,
        teamId: true,
        positionId: true,
        playerName: true,
      },
    }),
    prisma.fixtureLineupDetail.findMany({
      where: {
        fixtureId: internalFixtureId,
        typeId: { in: [DETAIL_TYPE.RATING, DETAIL_TYPE.MINUTES] },
      },
      select: { playerId: true, typeId: true, value: true },
    }),
    prisma.fixtureEvent.findMany({
      where: {
        fixtureId: internalFixtureId,
        typeId: {
          in: [
            EVENT_TYPE.GOAL,
            EVENT_TYPE.PENALTY_GOAL,
            EVENT_TYPE.YELLOW_CARD,
            EVENT_TYPE.RED_CARD,
          ],
        },
      },
      select: { playerId: true, relatedPlayerId: true, typeId: true },
    }),
  ]);

  // --- Per-player raw facts, keyed by Sportmonks player id ------------------
  const ratingByPlayer = new Map<number, number>();
  const minutesByPlayer = new Map<number, number>();
  for (const d of details) {
    if (d.playerId === null || d.value === null) continue;
    if (d.typeId === DETAIL_TYPE.RATING) {
      const r = Number.parseFloat(d.value);
      if (Number.isFinite(r)) ratingByPlayer.set(d.playerId, r);
    } else if (d.typeId === DETAIL_TYPE.MINUTES) {
      const m = Number.parseInt(d.value, 10);
      if (Number.isFinite(m)) minutesByPlayer.set(d.playerId, m);
    }
  }

  const goals = new Map<number, number>();
  const penaltyGoals = new Map<number, number>();
  const yellows = new Map<number, number>();
  const reds = new Map<number, number>();
  const assists = new Map<number, number>();
  const inc = (m: Map<number, number>, key: number | null) => {
    if (key === null) return;
    m.set(key, (m.get(key) ?? 0) + 1);
  };
  for (const e of events) {
    switch (e.typeId) {
      case EVENT_TYPE.GOAL:
        inc(goals, e.playerId);
        inc(assists, e.relatedPlayerId);
        break;
      case EVENT_TYPE.PENALTY_GOAL:
        inc(penaltyGoals, e.playerId);
        inc(assists, e.relatedPlayerId);
        break;
      case EVENT_TYPE.YELLOW_CARD:
        inc(yellows, e.playerId);
        break;
      case EVENT_TYPE.RED_CARD:
        inc(reds, e.playerId);
        break;
    }
  }

  // --- Ensure internal Player rows exist for every lineup player ------------
  // player_match_scores.player_id is an FK to players.id, so we derive minimal
  // player rows from the synced lineup data (idempotent upsert by sportmonks id).
  const seen = new Set<number>();
  const uniqueLineupPlayers = lineups.filter((l) => {
    if (l.playerId === null || seen.has(l.playerId)) return false;
    seen.add(l.playerId);
    return true;
  });

  await prisma.$transaction(
    uniqueLineupPlayers.map((l) =>
      prisma.player.upsert({
        where: { sportmonksPlayerId: l.playerId! },
        create: {
          sportmonksPlayerId: l.playerId!,
          name: l.playerName ?? `Player ${l.playerId}`,
          positionId: l.positionId,
        },
        // Don't mutate canonical player master data on rerun: a player's
        // position can vary match-to-match, so leave existing rows untouched.
        // The score row itself uses this fixture's lineup position directly.
        update: {},
        select: { id: true },
      }),
    ),
  );

  const internalPlayers = await prisma.player.findMany({
    where: {
      sportmonksPlayerId: {
        in: uniqueLineupPlayers.map((l) => l.playerId!),
      },
    },
    select: { id: true, sportmonksPlayerId: true },
  });
  const internalIdBySportmonksId = new Map(
    internalPlayers.map((p) => [p.sportmonksPlayerId, p.id]),
  );

  // --- Compute points and upsert player_match_scores ------------------------
  const calculatedAt = new Date();
  const upserts = uniqueLineupPlayers.map((l) => {
    const sportmonksPlayerId = l.playerId!;
    const internalPlayerId = internalIdBySportmonksId.get(sportmonksPlayerId)!;

    const minutes = minutesByPlayer.get(sportmonksPlayerId) ?? 0;
    const rating = ratingByPlayer.has(sportmonksPlayerId)
      ? ratingByPlayer.get(sportmonksPlayerId)!
      : null;
    const goalCount = goals.get(sportmonksPlayerId) ?? 0;
    const penaltyGoalCount = penaltyGoals.get(sportmonksPlayerId) ?? 0;
    const assistCount = assists.get(sportmonksPlayerId) ?? 0;
    const yellowCount = yellows.get(sportmonksPlayerId) ?? 0;
    const redCount = reds.get(sportmonksPlayerId) ?? 0;

    const pointsRating = ratingPoints(rating);
    const pointsMinutes = minutesPoints(minutes);
    // A penalty goal counts as a normal goal (docs/SCORING_RULES.md §7).
    const pointsGoals =
      (goalCount + penaltyGoalCount) * goalPointsForPosition(l.positionId);
    const pointsAssists = assistCount * ASSIST_POINTS;
    const pointsCards = cardPoints(yellowCount, redCount);
    const pointsTotal =
      pointsRating + pointsMinutes + pointsGoals + pointsAssists + pointsCards;

    const data = {
      teamId: null,
      positionId: l.positionId,
      minutes,
      rating,
      goals: goalCount,
      penaltyGoals: penaltyGoalCount,
      assists: assistCount,
      yellowCards: yellowCount,
      redCards: redCount,
      pointsRating,
      pointsMinutes,
      pointsGoals,
      pointsAssists,
      pointsCards,
      pointsTotal,
      calculatedAt,
    };

    return prisma.playerMatchScore.upsert({
      where: {
        fixtureId_playerId: {
          fixtureId: internalFixtureId,
          playerId: internalPlayerId,
        },
      },
      create: {
        fixtureId: internalFixtureId,
        playerId: internalPlayerId,
        ...data,
      },
      update: data,
    });
  });

  await prisma.$transaction(upserts);

  return upserts.length;
}
