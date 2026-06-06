import "server-only";

import { prisma } from "@/lib/db";
import {
  SportmonksError,
  getFixtureById,
  getFixtureWithParticipants,
  getFixtureWithEvents,
  getFixtureWithLineups,
  getFixtureWithLineupDetails,
  type SportmonksLineup,
  type SportmonksLineupDetail,
} from "@/lib/sportmonks";

/**
 * Fixture sync (Task 4): pull one Sportmonks fixture and store its raw data in
 * our own tables (fixtures, fixture_participants, fixture_events,
 * fixture_lineups, fixture_lineup_details).
 *
 * Rules (docs/API_SYNC_PLAN.md, docs/CODING_AGENT_TASKS.md §6/§7):
 * - All reads go through the server-only Sportmonks client (Task 3).
 * - Every write is an UPSERT keyed on a unique Sportmonks id (or composite),
 *   so running the sync twice creates no duplicates.
 * - Each run writes one api_sync_logs row.
 * - Partial failures are tolerated: a failing section is recorded and the run
 *   is marked "partial" instead of aborting everything.
 * - No scoring here (Task 5+). Raw data only.
 */

type SectionResult = { fetched: number; created: number; updated: number };

export type SyncFixtureResult = {
  status: "success" | "partial" | "failed";
  sportmonksFixtureId: number;
  fixtureId?: number;
  logId: number;
  sections: Record<string, SectionResult>;
  totals: SectionResult;
  errors: string[];
};

const EMPTY_SECTION: SectionResult = { fetched: 0, created: 0, updated: 0 };

/** Parses a Sportmonks "YYYY-MM-DD HH:mm:ss" (UTC) timestamp into a Date. */
function parseSportmonksDate(value?: string | null): Date | null {
  if (!value) return null;
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

export async function syncFixture(
  sportmonksFixtureId: number,
): Promise<SyncFixtureResult> {
  const startedAt = new Date();
  const log = await prisma.apiSyncLog.create({
    data: {
      provider: "sportmonks",
      syncType: "fixture",
      status: "running",
      startedAt,
    },
  });

  const sections: Record<string, SectionResult> = {};
  const errors: string[] = [];

  const finalize = async (
    status: SyncFixtureResult["status"],
    fixtureId?: number,
  ): Promise<SyncFixtureResult> => {
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
      sportmonksFixtureId,
      fixtureId,
      logId: log.id,
      sections,
      totals,
      errors,
    };
  };

  // --- Fixture detail (fatal if it fails: nothing else can be stored) -------
  let participants: Awaited<
    ReturnType<typeof getFixtureWithParticipants>
  >["participants"];
  try {
    const withParticipants = await getFixtureWithParticipants(
      sportmonksFixtureId,
    );
    participants = withParticipants.participants ?? [];
  } catch (error) {
    participants = undefined;
    errors.push(`participants: ${describeError(error)}`);
  }

  let internalFixtureId: number;
  try {
    const fixture = await getFixtureById(sportmonksFixtureId);

    const homeTeamId =
      participants?.find((p) => p.meta?.location === "home")?.id ?? null;
    const awayTeamId =
      participants?.find((p) => p.meta?.location === "away")?.id ?? null;

    const startingAt = parseSportmonksDate(fixture.starting_at);
    const startingAtTimestamp =
      typeof fixture.starting_at_timestamp === "number"
        ? BigInt(fixture.starting_at_timestamp)
        : null;

    const existingFixture = await prisma.fixture.findUnique({
      where: { sportmonksFixtureId },
      select: { id: true },
    });

    const data = {
      sportId: numberOrNull(fixture.sport_id),
      leagueId: numberOrNull(fixture.league_id),
      seasonId: numberOrNull(fixture.season_id),
      stageId: numberOrNull(fixture.stage_id),
      roundId: numberOrNull(fixture.round_id),
      stateId: numberOrNull(fixture.state_id),
      venueId: numberOrNull(fixture.venue_id),
      homeTeamId,
      awayTeamId,
      name: toStringOrNull(fixture.name),
      startingAt,
      startingAtTimestamp,
      resultInfo: toStringOrNull(fixture.result_info),
      length: numberOrNull(fixture.length),
      hasOdds: Boolean(fixture.has_odds),
    };

    const saved = await prisma.fixture.upsert({
      where: { sportmonksFixtureId },
      create: { sportmonksFixtureId, ...data },
      update: data,
      select: { id: true },
    });
    internalFixtureId = saved.id;
    sections.fixture = {
      fetched: 1,
      created: existingFixture ? 0 : 1,
      updated: existingFixture ? 1 : 0,
    };
  } catch (error) {
    errors.push(`fixture: ${describeError(error)}`);
    return finalize("failed");
  }

  // --- Participants ---------------------------------------------------------
  if (participants) {
    try {
      const existing = await prisma.fixtureParticipant.findMany({
        where: { fixtureId: internalFixtureId },
        select: { teamId: true },
      });
      const existingTeams = new Set(existing.map((e) => e.teamId));

      await prisma.$transaction(
        participants.map((p) => {
          const data = {
            location: toStringOrNull(p.meta?.location),
            winner: p.meta?.winner ?? null,
            position: numberOrNull(p.meta?.position),
          };
          return prisma.fixtureParticipant.upsert({
            where: {
              fixtureId_teamId: { fixtureId: internalFixtureId, teamId: p.id },
            },
            create: { fixtureId: internalFixtureId, teamId: p.id, ...data },
            update: data,
          });
        }),
      );

      const created = participants.filter((p) => !existingTeams.has(p.id))
        .length;
      sections.participants = {
        fetched: participants.length,
        created,
        updated: participants.length - created,
      };
    } catch (error) {
      errors.push(`participants(store): ${describeError(error)}`);
    }
  }

  // --- Events ---------------------------------------------------------------
  try {
    const { events = [] } = await getFixtureWithEvents(sportmonksFixtureId);
    const ids = events.map((e) => BigInt(e.id));
    const existing = await prisma.fixtureEvent.findMany({
      where: { sportmonksEventId: { in: ids } },
      select: { sportmonksEventId: true },
    });
    const existingIds = new Set(existing.map((e) => e.sportmonksEventId));

    await prisma.$transaction(
      events.map((e) => {
        const data = {
          fixtureId: internalFixtureId,
          teamId: numberOrNull(e.participant_id ?? null),
          playerId: numberOrNull(e.player_id ?? null),
          relatedPlayerId: numberOrNull(e.related_player_id ?? null),
          typeId: numberOrNull(e.type_id),
          minute: numberOrNull(e.minute ?? null),
          extraMinute: numberOrNull(e.extra_minute ?? null),
          result: toStringOrNull(e.result),
          info: toStringOrNull(e.info),
          addition: toStringOrNull(e.addition),
        };
        return prisma.fixtureEvent.upsert({
          where: { sportmonksEventId: BigInt(e.id) },
          create: { sportmonksEventId: BigInt(e.id), ...data },
          update: data,
        });
      }),
    );

    const created = events.filter((e) => !existingIds.has(BigInt(e.id))).length;
    sections.events = {
      fetched: events.length,
      created,
      updated: events.length - created,
    };
  } catch (error) {
    errors.push(`events: ${describeError(error)}`);
  }

  // --- Lineups --------------------------------------------------------------
  try {
    const { lineups = [] } = await getFixtureWithLineups(sportmonksFixtureId);
    sections.lineups = await upsertLineups(internalFixtureId, lineups);
  } catch (error) {
    errors.push(`lineups: ${describeError(error)}`);
  }

  // --- Lineup details -------------------------------------------------------
  try {
    const { lineups = [] } =
      await getFixtureWithLineupDetails(sportmonksFixtureId);

    // Map Sportmonks lineup id -> our internal lineup id.
    const internalLineups = await prisma.fixtureLineup.findMany({
      where: { fixtureId: internalFixtureId },
      select: { id: true, sportmonksLineupId: true },
    });
    const lineupMap = new Map(
      internalLineups.map((l) => [l.sportmonksLineupId, l.id]),
    );

    const flatDetails: Array<{
      detail: SportmonksLineupDetail;
      internalLineupId: number | null;
    }> = [];
    for (const lineup of lineups) {
      const internalLineupId = lineupMap.get(BigInt(lineup.id)) ?? null;
      for (const detail of lineup.details ?? []) {
        flatDetails.push({ detail, internalLineupId });
      }
    }

    const ids = flatDetails.map((d) => BigInt(d.detail.id));
    const existing = await prisma.fixtureLineupDetail.findMany({
      where: { sportmonksDetailId: { in: ids } },
      select: { sportmonksDetailId: true },
    });
    const existingIds = new Set(existing.map((e) => e.sportmonksDetailId));

    await prisma.$transaction(
      flatDetails.map(({ detail, internalLineupId }) => {
        const data = {
          fixtureId: internalFixtureId,
          lineupId: internalLineupId,
          playerId: numberOrNull(detail.player_id ?? null),
          teamId: numberOrNull(detail.team_id ?? null),
          typeId: numberOrNull(detail.type_id),
          value: toStringOrNull(detail.data?.value),
        };
        return prisma.fixtureLineupDetail.upsert({
          where: { sportmonksDetailId: BigInt(detail.id) },
          create: { sportmonksDetailId: BigInt(detail.id), ...data },
          update: data,
        });
      }),
    );

    const created = flatDetails.filter(
      (d) => !existingIds.has(BigInt(d.detail.id)),
    ).length;
    sections.lineupDetails = {
      fetched: flatDetails.length,
      created,
      updated: flatDetails.length - created,
    };
  } catch (error) {
    errors.push(`lineupDetails: ${describeError(error)}`);
  }

  return finalize(errors.length ? "partial" : "success", internalFixtureId);
}

async function upsertLineups(
  internalFixtureId: number,
  lineups: SportmonksLineup[],
): Promise<SectionResult> {
  const ids = lineups.map((l) => BigInt(l.id));
  const existing = await prisma.fixtureLineup.findMany({
    where: { sportmonksLineupId: { in: ids } },
    select: { sportmonksLineupId: true },
  });
  const existingIds = new Set(existing.map((e) => e.sportmonksLineupId));

  await prisma.$transaction(
    lineups.map((l) => {
      const data = {
        fixtureId: internalFixtureId,
        playerId: numberOrNull(l.player_id ?? null),
        teamId: numberOrNull(l.team_id ?? null),
        positionId: numberOrNull(l.position_id ?? null),
        formationField: toStringOrNull(l.formation_field),
        formationPosition: toStringOrNull(l.formation_position),
        typeId: numberOrNull(l.type_id),
        playerName: toStringOrNull(l.player_name),
        jerseyNumber: numberOrNull(l.jersey_number ?? null),
      };
      return prisma.fixtureLineup.upsert({
        where: { sportmonksLineupId: BigInt(l.id) },
        create: { sportmonksLineupId: BigInt(l.id), ...data },
        update: data,
      });
    }),
  );

  const created = lineups.filter((l) => !existingIds.has(BigInt(l.id))).length;
  return {
    fetched: lineups.length,
    created,
    updated: lineups.length - created,
  };
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function describeError(error: unknown): string {
  if (error instanceof SportmonksError) {
    return error.status ? `${error.message} (HTTP ${error.status})` : error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}
