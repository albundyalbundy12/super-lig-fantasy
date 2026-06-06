import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  DEFAULT_START_BUDGET,
  DENGELI_INITIAL_VALUE_RANGES,
  DENGELI_LEAGUE,
  DENGELI_MANAGERS,
  DENGELI_SQUAD_COMPOSITION,
  DENGELI_SQUAD_SIZE,
} from "@/config/constants";

/**
 * Dengeli Başlangıç — balanced starter squad generation (Task 9).
 *
 * Builds a small, deterministic demo league in which every manager gets a legal
 * 15-player squad (2 GK, 5 DEF, 5 MID, 3 FWD) of roughly equal total market
 * value, so no manager starts with an unfair topstar advantage. Remaining
 * budget is the start budget minus the squad value.
 *
 * Everything is derived from players already in the database — no Sportmonks
 * calls. The Task 6 test manager (its own league) is never touched.
 *
 * Determinism: market values are derived from each player's stable Sportmonks
 * id; players are drafted in a fixed value-sorted order via a per-position snake
 * draft. Idempotency: the league/users/members/teams are upserted on their
 * unique keys and each squad is rebuilt (delete + recreate, since
 * manager_squad_players has no unique key), so re-running creates no duplicates.
 */

export type DengeliManagerSummary = {
  managerTeamId: number;
  teamName: string;
  squadCount: number;
  positionCounts: Record<string, number>;
  squadValue: number;
  remainingBudget: number;
};

export type GenerateDengeliResult = {
  status: "success" | "failed";
  leagueId?: number;
  managerCount: number;
  startBudget: number;
  marketValuesAssigned: number;
  managers: DengeliManagerSummary[];
  squadValueSpread: { min: number; max: number; diff: number };
  errorMessage: string | null;
};

/** Deterministic initial market value (TL) for a player, by position + id. */
export function initialMarketValue(
  positionId: number | null,
  sportmonksPlayerId: number,
): number {
  const range =
    (positionId !== null && DENGELI_INITIAL_VALUE_RANGES[positionId]) || {
      min: 2_000_000,
      max: 5_000_000,
      step: 500_000,
    };
  const buckets = Math.floor((range.max - range.min) / range.step) + 1;
  const bucket = sportmonksPlayerId % buckets;
  return range.min + bucket * range.step;
}

/**
 * Set current_market_value for every player that still has none (value 0).
 * Returns how many players were updated. Safe to run repeatedly.
 */
export async function assignInitialMarketValues(
  db: Prisma.TransactionClient = prisma,
): Promise<number> {
  const players = await db.player.findMany({
    where: { currentMarketValue: 0 },
    select: { id: true, positionId: true, sportmonksPlayerId: true },
  });

  let updated = 0;
  for (const p of players) {
    await db.player.update({
      where: { id: p.id },
      data: {
        currentMarketValue: initialMarketValue(p.positionId, p.sportmonksPlayerId),
      },
    });
    updated += 1;
  }
  return updated;
}

type DraftPlayer = { id: number; value: number; code: string };

/**
 * Distribute a value-sorted pool across managers using a snake draft. With the
 * pool sorted high -> low, the snake order (0,1,1,0,0,1,...) hands out the most
 * valuable players in an alternating pattern so totals stay close. `startIndex`
 * rotates which manager picks first per position, spreading the tiny first-pick
 * advantage across positions.
 */
function snakeDraft(
  pool: DraftPlayer[],
  managerCount: number,
  perManager: number,
  startIndex: number,
): DraftPlayer[][] {
  const assignments: DraftPlayer[][] = Array.from(
    { length: managerCount },
    () => [],
  );
  let pick = 0;
  for (let round = 0; round < perManager; round += 1) {
    const order: number[] = [];
    for (let i = 0; i < managerCount; i += 1) {
      order.push((startIndex + i) % managerCount);
    }
    if (round % 2 === 1) order.reverse();
    for (const managerIndex of order) {
      assignments[managerIndex].push(pool[pick]);
      pick += 1;
    }
  }
  return assignments;
}

export async function generateBalancedSquads(): Promise<GenerateDengeliResult> {
  try {
    const managerConfigs = DENGELI_MANAGERS;
    const managerCount = managerConfigs.length;

    // All reads + writes run in one interactive transaction so a mid-run failure
    // leaves no partial state. The whole operation is also idempotent on rerun.
    const { leagueId, marketValuesAssigned, managers } =
      await prisma.$transaction(
        async (tx) => {
          // 1) Ensure every player has an initial market value.
          const assigned = await assignInitialMarketValues(tx);

          // 2) Group players by position, each sorted by value desc (tie-break id
          //    asc) for a fully deterministic draft order. Validate pool size.
          const perManagerSquad: DraftPlayer[][] = Array.from(
            { length: managerCount },
            () => [],
          );

          for (let p = 0; p < DENGELI_SQUAD_COMPOSITION.length; p += 1) {
            const slot = DENGELI_SQUAD_COMPOSITION[p];
            const needed = slot.count * managerCount;
            const pool = await tx.player.findMany({
              where: { positionId: slot.positionId },
              select: { id: true, currentMarketValue: true },
              orderBy: [{ currentMarketValue: "desc" }, { id: "asc" }],
            });

            if (pool.length < needed) {
              throw new Error(
                `Not enough ${slot.code} players: need ${needed} (${slot.count} × ${managerCount} managers) but only ${pool.length} available.`,
              );
            }

            const draftPool: DraftPlayer[] = pool
              .slice(0, needed)
              .map((pl) => ({
                id: pl.id,
                value: pl.currentMarketValue,
                code: slot.code,
              }));

            const assignments = snakeDraft(
              draftPool,
              managerCount,
              slot.count,
              p % managerCount,
            );
            for (let m = 0; m < managerCount; m += 1) {
              perManagerSquad[m].push(...assignments[m]);
            }
          }

          // 3) Upsert the demo league. seasonId is nullable, no fixture coupling.
          const owner = await tx.user.upsert({
            where: { email: managerConfigs[0].email },
            create: {
              email: managerConfigs[0].email,
              name: managerConfigs[0].userName,
            },
            update: {},
            select: { id: true },
          });

          const league = await tx.fantasyLeague.upsert({
            where: { inviteCode: DENGELI_LEAGUE.inviteCode },
            create: {
              name: DENGELI_LEAGUE.name,
              inviteCode: DENGELI_LEAGUE.inviteCode,
              ownerUserId: owner.id,
              startMode: "dengeli_baslangic",
              budgetStart: DEFAULT_START_BUDGET,
            },
            update: { startMode: "dengeli_baslangic" },
            select: { id: true },
          });

          // 4) Build each manager's user / membership / team and (re)assign squad.
          const summaries: DengeliManagerSummary[] = [];

          for (let m = 0; m < managerCount; m += 1) {
            const cfg = managerConfigs[m];
            const user = await tx.user.upsert({
              where: { email: cfg.email },
              create: { email: cfg.email, name: cfg.userName },
              update: {},
              select: { id: true },
            });

            await tx.fantasyLeagueMember.upsert({
              where: {
                fantasyLeagueId_userId: {
                  fantasyLeagueId: league.id,
                  userId: user.id,
                },
              },
              create: {
                fantasyLeagueId: league.id,
                userId: user.id,
                role: m === 0 ? "owner" : "member",
              },
              update: {},
            });

            const team = await tx.managerTeam.upsert({
              where: {
                fantasyLeagueId_userId: {
                  fantasyLeagueId: league.id,
                  userId: user.id,
                },
              },
              create: {
                fantasyLeagueId: league.id,
                userId: user.id,
                name: cfg.teamName,
                budget: DEFAULT_START_BUDGET,
              },
              update: { name: cfg.teamName },
              select: { id: true },
            });

            const squad = perManagerSquad[m];
            const squadValue = squad.reduce((sum, pl) => sum + pl.value, 0);
            const remainingBudget = DEFAULT_START_BUDGET - squadValue;

            // Rebuild the squad: manager_squad_players has no unique key, so we
            // delete then recreate to stay idempotent across reruns.
            await tx.managerSquadPlayer.deleteMany({
              where: { managerTeamId: team.id },
            });
            await tx.managerSquadPlayer.createMany({
              data: squad.map((pl) => ({
                managerTeamId: team.id,
                playerId: pl.id,
                purchasePrice: pl.value,
                currentValueAtPurchase: pl.value,
                acquiredVia: "dengeli_baslangic",
              })),
            });

            await tx.managerTeam.update({
              where: { id: team.id },
              data: { squadValue, budget: remainingBudget },
            });

            // Position counts derived from the drafted squad (deterministic).
            const positionCounts: Record<string, number> = {};
            for (const slot of DENGELI_SQUAD_COMPOSITION) {
              positionCounts[slot.code] = squad.filter(
                (pl) => pl.code === slot.code,
              ).length;
            }

            summaries.push({
              managerTeamId: team.id,
              teamName: cfg.teamName,
              squadCount: squad.length,
              positionCounts,
              squadValue,
              remainingBudget,
            });
          }

          return {
            leagueId: league.id,
            marketValuesAssigned: assigned,
            managers: summaries,
          };
        },
        { timeout: 20_000 },
      );

    const values = managers.map((mgr) => mgr.squadValue);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      status: "success",
      leagueId,
      managerCount,
      startBudget: DEFAULT_START_BUDGET,
      marketValuesAssigned,
      managers,
      squadValueSpread: { min, max, diff: max - min },
      errorMessage: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "failed",
      managerCount: DENGELI_MANAGERS.length,
      startBudget: DEFAULT_START_BUDGET,
      marketValuesAssigned: 0,
      managers: [],
      squadValueSpread: { min: 0, max: 0, diff: 0 },
      errorMessage: message,
    };
  }
}

export const DENGELI_EXPECTED_SQUAD_SIZE = DENGELI_SQUAD_SIZE;
