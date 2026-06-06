import "server-only";

import { prisma } from "@/lib/db";
import {
  SportmonksError,
  getSeason,
  getRoundsBySeason,
  getFixturesBySeason,
  type SportmonksFixture,
} from "@/lib/sportmonks";

/**
 * Current-season sync (Task 12): pull the current Süper Lig season, its rounds
 * and its fixtures from Sportmonks and store them in our own tables (seasons,
 * rounds, fixtures).
 *
 * Rules (docs/API_SYNC_PLAN.md, docs/CODING_AGENT_TASKS.md):
 * - All reads go through the server-only Sportmonks client.
 * - Every write is an UPSERT keyed on a unique Sportmonks id, so running the
 *   sync twice creates no duplicates.
 * - Each run writes one api_sync_logs row.
 * - A failing section is recorded; the run is marked "partial" instead of
 *   aborting everything.
 * - No participants/events/lineups/scoring here. This is season + rounds +
 *   fixtures only and does NOT touch the historical test fixture (18903623),
 *   which lives in a different season (22057).
 *
 * The round lock time (earliest fixture starting_at per round) is computed on
 * read — see getStoredSeasonReport — because the schema has no lock-time column.
 */

type SectionResult = { fetched: number; created: number; updated: number };

export type SyncSeasonResult = {
  status: "success" | "partial" | "failed";
  sportmonksSeasonId: number;
  seasonId?: number;
  logId: number;
  sections: Record<string, SectionResult>;
  errors: string[];
};

const EMPTY_SECTION: SectionResult = { fetched: 0, created: 0, updated: 0 };

/** Parses a Sportmonks date. Handles both "YYYY-MM-DD HH:mm:ss" and date-only
 * "YYYY-MM-DD" (rounds use date-only), all treated as UTC. */
function parseSportmonksDate(value?: string | null): Date | null {
  if (!value) return null;
  let s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    s = `${s}T00:00:00Z`;
  } else {
    s = s.includes("T") ? s : s.replace(" ", "T");
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s = `${s}Z`;
  }
  const date = new Date(s);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function describeError(error: unknown): string {
  if (error instanceof SportmonksError) {
    return error.status
      ? `${error.message} (HTTP ${error.status})`
      : error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function syncCurrentSeason(
  sportmonksSeasonId: number,
): Promise<SyncSeasonResult> {
  const startedAt = new Date();
  const log = await prisma.apiSyncLog.create({
    data: {
      provider: "sportmonks",
      syncType: "season",
      status: "running",
      startedAt,
    },
  });

  const sections: Record<string, SectionResult> = {};
  const errors: string[] = [];

  const finalize = async (
    status: SyncSeasonResult["status"],
    seasonId?: number,
  ): Promise<SyncSeasonResult> => {
    const totals = Object.values(sections).reduce<SectionResult>(
      (acc, s) => ({
        fetched: acc.fetched + s.fetched,
        created: acc.created + s.created,
        updated: acc.updated + s.updated,
      }),
      { ...EMPTY_SECTION },
    );

    await prisma.apiSyncLog.update({
      where: { id: log.id },
      data: {
        status,
        finishedAt: new Date(),
        itemsFetched: totals.fetched,
        itemsCreated: totals.created,
        itemsUpdated: totals.updated,
        errorMessage: errors.length ? errors.join(" | ") : null,
      },
    });

    return {
      status,
      sportmonksSeasonId,
      seasonId,
      logId: log.id,
      sections,
      errors,
    };
  };

  // --- Season (fatal if it fails: rounds reference our internal season id) ---
  let internalSeasonId: number;
  try {
    const season = await getSeason(sportmonksSeasonId);
    const existing = await prisma.season.findUnique({
      where: { sportmonksSeasonId },
      select: { id: true },
    });
    const data = {
      leagueId: numberOrNull(season.league_id) ?? 0,
      name: toStringOrNull(season.name),
      isCurrent: Boolean(season.is_current),
      startsAt: parseSportmonksDate(season.starting_at),
      endsAt: parseSportmonksDate(season.ending_at),
    };
    const saved = await prisma.season.upsert({
      where: { sportmonksSeasonId },
      create: { sportmonksSeasonId, ...data },
      update: data,
      select: { id: true },
    });
    internalSeasonId = saved.id;
    sections.season = {
      fetched: 1,
      created: existing ? 0 : 1,
      updated: existing ? 1 : 0,
    };
  } catch (error) {
    errors.push(`season: ${describeError(error)}`);
    return finalize("failed");
  }

  // --- Rounds ---------------------------------------------------------------
  try {
    const rounds = await getRoundsBySeason(sportmonksSeasonId);
    const ids = rounds.map((r) => r.id);
    const existing = await prisma.round.findMany({
      where: { sportmonksRoundId: { in: ids } },
      select: { sportmonksRoundId: true },
    });
    const existingIds = new Set(existing.map((r) => r.sportmonksRoundId));

    for (const part of chunk(rounds, 100)) {
      await prisma.$transaction(
        part.map((r) => {
          const roundNumber = numberOrNull(r.name);
          const status = r.is_current
            ? "current"
            : r.finished
              ? "finished"
              : "scheduled";
          const data = {
            seasonId: internalSeasonId,
            name: toStringOrNull(r.name),
            roundNumber,
            status,
            startsAt: parseSportmonksDate(r.starting_at),
            endsAt: parseSportmonksDate(r.ending_at),
          };
          return prisma.round.upsert({
            where: { sportmonksRoundId: r.id },
            create: { sportmonksRoundId: r.id, ...data },
            update: data,
          });
        }),
      );
    }

    const created = rounds.filter((r) => !existingIds.has(r.id)).length;
    sections.rounds = {
      fetched: rounds.length,
      created,
      updated: rounds.length - created,
    };
  } catch (error) {
    errors.push(`rounds: ${describeError(error)}`);
  }

  // --- Fixtures -------------------------------------------------------------
  try {
    const fixtures = await getFixturesBySeason(sportmonksSeasonId);
    const ids = fixtures.map((f) => f.id);
    const existing = await prisma.fixture.findMany({
      where: { sportmonksFixtureId: { in: ids } },
      select: { sportmonksFixtureId: true },
    });
    const existingIds = new Set(existing.map((f) => f.sportmonksFixtureId));

    for (const part of chunk(fixtures, 100)) {
      await prisma.$transaction(part.map((f) => upsertFixture(f)));
    }

    const created = fixtures.filter((f) => !existingIds.has(f.id)).length;
    sections.fixtures = {
      fetched: fixtures.length,
      created,
      updated: fixtures.length - created,
    };
  } catch (error) {
    errors.push(`fixtures: ${describeError(error)}`);
  }

  return finalize(errors.length ? "partial" : "success", internalSeasonId);
}

/**
 * Upserts one season fixture. We do NOT set home/away team ids here (the season
 * `include=fixtures` payload has no participants), so we omit them to avoid
 * overwriting any participant data set by the dedicated fixture sync.
 */
function upsertFixture(f: SportmonksFixture) {
  const startingAt = parseSportmonksDate(f.starting_at);
  const startingAtTimestamp =
    typeof f.starting_at_timestamp === "number"
      ? BigInt(f.starting_at_timestamp)
      : null;
  const data = {
    sportId: numberOrNull(f.sport_id),
    leagueId: numberOrNull(f.league_id),
    seasonId: numberOrNull(f.season_id),
    stageId: numberOrNull(f.stage_id),
    roundId: numberOrNull(f.round_id),
    stateId: numberOrNull(f.state_id),
    venueId: numberOrNull(f.venue_id),
    name: toStringOrNull(f.name),
    startingAt,
    startingAtTimestamp,
    resultInfo: toStringOrNull(f.result_info),
    length: numberOrNull(f.length),
    hasOdds: Boolean(f.has_odds),
  };
  return prisma.fixture.upsert({
    where: { sportmonksFixtureId: f.id },
    create: { sportmonksFixtureId: f.id, ...data },
    update: data,
  });
}

export type SeasonRoundReport = {
  sportmonksRoundId: number;
  name: string | null;
  roundNumber: number | null;
  status: string;
  fixtureCount: number;
  /** Earliest fixture starting_at in the round = the round lock time. */
  lockTime: Date | null;
};

export type StoredSeasonReport = {
  exists: boolean;
  season?: {
    sportmonksSeasonId: number;
    name: string | null;
    isCurrent: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  };
  totalRounds: number;
  totalFixtures: number;
  nextRound: SeasonRoundReport | null;
  rounds: SeasonRoundReport[];
};

/**
 * Reads the stored season, its rounds and fixtures from our own DB and computes
 * the per-round lock time (earliest fixture starting_at). Pure DB read — makes
 * no Sportmonks calls.
 */
export async function getStoredSeasonReport(
  sportmonksSeasonId: number,
): Promise<StoredSeasonReport> {
  const season = await prisma.season.findUnique({
    where: { sportmonksSeasonId },
  });
  if (!season) {
    return { exists: false, totalRounds: 0, totalFixtures: 0, nextRound: null, rounds: [] };
  }

  const rounds = await prisma.round.findMany({
    where: { seasonId: season.id },
  });

  // Fixtures store the RAW Sportmonks season/round ids.
  const fixtures = await prisma.fixture.findMany({
    where: { seasonId: sportmonksSeasonId },
    select: { roundId: true, startingAt: true },
  });

  const lockByRound = new Map<number, Date | null>();
  const countByRound = new Map<number, number>();
  for (const f of fixtures) {
    if (f.roundId === null) continue;
    countByRound.set(f.roundId, (countByRound.get(f.roundId) ?? 0) + 1);
    if (f.startingAt) {
      const current = lockByRound.get(f.roundId);
      if (!current || f.startingAt < current) {
        lockByRound.set(f.roundId, f.startingAt);
      }
    } else if (!lockByRound.has(f.roundId)) {
      lockByRound.set(f.roundId, null);
    }
  }

  const reportRounds: SeasonRoundReport[] = rounds
    .map((r) => ({
      sportmonksRoundId: r.sportmonksRoundId,
      name: r.name,
      roundNumber: r.roundNumber,
      status: r.status,
      fixtureCount: countByRound.get(r.sportmonksRoundId) ?? 0,
      lockTime: lockByRound.get(r.sportmonksRoundId) ?? null,
    }))
    .sort((a, b) => {
      if (a.roundNumber !== null && b.roundNumber !== null) {
        return a.roundNumber - b.roundNumber;
      }
      const at = a.lockTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bt = b.lockTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return at - bt;
    });

  const now = Date.now();
  const nextRound =
    reportRounds.find(
      (r) => r.lockTime !== null && r.lockTime.getTime() > now,
    ) ?? null;

  return {
    exists: true,
    season: {
      sportmonksSeasonId: season.sportmonksSeasonId,
      name: season.name,
      isCurrent: season.isCurrent,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
    },
    totalRounds: rounds.length,
    totalFixtures: fixtures.length,
    nextRound,
    rounds: reportRounds,
  };
}
