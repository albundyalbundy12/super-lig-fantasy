import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Transfermarkt MVP (Task 10) — simple buy / sell against the system.
 *
 * Scope (intentionally minimal): the "test manager" buys unowned players from
 * the league and sells owned players back to the system. No auctions, no
 * bidding, no payments, no auth, no Sportmonks calls. Everything is derived
 * from players and manager squads already in the database.
 *
 * Selected league / test manager: the first manager team (lowest id) — the same
 * team the squad/lineup/points pages already show, so a purchase here shows up
 * there immediately.
 *
 * Ownership rule (docs/DATABASE_SCHEMA.md): inside one fantasy league a player
 * can belong to only one manager. We enforce this by checking for an existing
 * active manager_squad_players row for the player across the league.
 *
 * Safety / idempotency: buying a player already owned by this team is a no-op
 * (no double charge); selling a player not in the squad is a no-op. All money
 * moves happen inside a transaction, and we sell by hard-deleting the squad row
 * so the player immediately becomes available again everywhere. Each
 * transaction first takes a per-league Postgres advisory lock, so concurrent
 * buy/sell requests in the same league are serialized — the ownership check and
 * budget math can never race (no duplicate ownership, no lost budget updates).
 */

/** Namespace for pg_advisory_xact_lock so our keys don't collide with others. */
const TRANSFER_LOCK_NAMESPACE = 910_010;

/** Serialize all transfer operations within a league for the current tx. */
async function lockLeague(
  tx: Prisma.TransactionClient,
  fantasyLeagueId: number,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${TRANSFER_LOCK_NAMESPACE}::int, ${fantasyLeagueId}::int)`;
}

export type TransferStatus =
  | "bought"
  | "sold"
  | "already_owned"
  | "owned_by_other"
  | "insufficient_budget"
  | "not_owned"
  | "not_found"
  | "no_team"
  | "error";

export type TransferResult = {
  status: TransferStatus;
  playerName?: string;
  amount?: number;
  message?: string;
};

type ActiveTeam = {
  id: number;
  name: string;
  budget: number;
  fantasyLeagueId: number;
};

/** The selected test manager team: the first team, matching the other pages. */
async function getActiveManagerTeam(): Promise<ActiveTeam | null> {
  return prisma.managerTeam.findFirst({
    orderBy: { id: "asc" },
    select: { id: true, name: true, budget: true, fantasyLeagueId: true },
  });
}

/** Current squad worth = sum of active squad players' market values (TL). */
async function recomputeSquadValue(
  tx: Prisma.TransactionClient,
  managerTeamId: number,
): Promise<number> {
  const rows = await tx.managerSquadPlayer.findMany({
    where: { managerTeamId, status: "active" },
    select: { player: { select: { currentMarketValue: true } } },
  });
  return rows.reduce((sum, r) => sum + r.player.currentMarketValue, 0);
}

export type TransferMarketData = {
  team: ActiveTeam;
  squad: Awaited<ReturnType<typeof loadSquad>>;
  available: Awaited<ReturnType<typeof loadAvailable>>;
};

function loadSquad(managerTeamId: number) {
  return prisma.managerSquadPlayer.findMany({
    where: { managerTeamId, status: "active" },
    include: {
      player: { include: { currentTeam: { select: { name: true } } } },
    },
    orderBy: [{ player: { positionId: "asc" } }, { playerId: "asc" }],
  });
}

function loadAvailable(excludePlayerIds: number[]) {
  return prisma.player.findMany({
    where: { id: { notIn: excludePlayerIds } },
    include: { currentTeam: { select: { name: true } } },
    orderBy: [{ currentMarketValue: "desc" }, { id: "asc" }],
  });
}

/** Data for the /transfer-market page: budget, current squad, unowned players. */
export async function getTransferMarketData(): Promise<TransferMarketData | null> {
  const team = await getActiveManagerTeam();
  if (!team) return null;

  const ownedInLeague = await prisma.managerSquadPlayer.findMany({
    where: {
      status: "active",
      managerTeam: { fantasyLeagueId: team.fantasyLeagueId },
    },
    select: { playerId: true },
  });
  const ownedIds = ownedInLeague.map((o) => o.playerId);

  const [squad, available] = await Promise.all([
    loadSquad(team.id),
    loadAvailable(ownedIds),
  ]);

  return { team, squad, available };
}

/** Buy a player for the test manager if the budget is enough and it's unowned. */
export async function buyPlayer(playerId: number): Promise<TransferResult> {
  const team = await getActiveManagerTeam();
  if (!team) return { status: "no_team" };

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { name: true, currentMarketValue: true },
  });
  if (!player) return { status: "not_found" };

  try {
    return await prisma.$transaction(async (tx) => {
      await lockLeague(tx, team.fantasyLeagueId);

      // One manager per player per league.
      const ownedInLeague = await tx.managerSquadPlayer.findFirst({
        where: {
          playerId,
          status: "active",
          managerTeam: { fantasyLeagueId: team.fantasyLeagueId },
        },
        select: { managerTeamId: true },
      });
      if (ownedInLeague) {
        return ownedInLeague.managerTeamId === team.id
          ? { status: "already_owned", playerName: player.name }
          : { status: "owned_by_other", playerName: player.name };
      }

      const fresh = await tx.managerTeam.findUnique({
        where: { id: team.id },
        select: { budget: true },
      });
      if (!fresh || fresh.budget < player.currentMarketValue) {
        return { status: "insufficient_budget", playerName: player.name };
      }

      await tx.managerSquadPlayer.create({
        data: {
          managerTeamId: team.id,
          playerId,
          purchasePrice: player.currentMarketValue,
          currentValueAtPurchase: player.currentMarketValue,
          acquiredVia: "transfer_market",
          status: "active",
        },
      });

      const squadValue = await recomputeSquadValue(tx, team.id);
      await tx.managerTeam.update({
        where: { id: team.id },
        data: {
          budget: { decrement: player.currentMarketValue },
          squadValue,
        },
      });

      return {
        status: "bought",
        playerName: player.name,
        amount: player.currentMarketValue,
      };
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Sell an owned player back to the system at its current market value (TL). */
export async function sellPlayer(playerId: number): Promise<TransferResult> {
  const team = await getActiveManagerTeam();
  if (!team) return { status: "no_team" };

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { name: true, currentMarketValue: true },
  });
  if (!player) return { status: "not_found" };

  try {
    return await prisma.$transaction(async (tx) => {
      await lockLeague(tx, team.fantasyLeagueId);

      const row = await tx.managerSquadPlayer.findFirst({
        where: { managerTeamId: team.id, playerId, status: "active" },
        select: { id: true },
      });
      if (!row) return { status: "not_owned", playerName: player.name };

      const salePrice = player.currentMarketValue;
      await tx.managerSquadPlayer.delete({ where: { id: row.id } });

      const squadValue = await recomputeSquadValue(tx, team.id);
      await tx.managerTeam.update({
        where: { id: team.id },
        data: { budget: { increment: salePrice }, squadValue },
      });

      return { status: "sold", playerName: player.name, amount: salePrice };
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
