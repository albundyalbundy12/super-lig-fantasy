import { getManagerRoundDetail, getManagerSquad } from "@/lib/fantasy/queries";
import { slotPositionLabel } from "@/lib/fantasy/format";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";
import { LineupClient } from "@/components/lineup-client";
import type { SlotData, BenchPlayer } from "@/components/lineup-client";

export const dynamic = "force-dynamic";

export default async function LineupPage() {
  const [detail, squadData] = await Promise.all([
    getManagerRoundDetail(),
    getManagerSquad(),
  ]);

  if (!detail || !detail.lineup || detail.lineup.slots.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Diziliş</h1>
          <p className="page-subtitle">İlk on bir — formasyon ve saha görünümü.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--t2)", fontSize: 14 }}>
            Henüz diziliş oluşturulmadı. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  const { roundScore, lineup, scoreByPlayerId } = detail;

  // Build serializable slot data for the client component
  const slots: SlotData[] = lineup.slots.map((slot) => {
    const isEmpty = slot.playerId === null || slot.player === null;
    const score = isEmpty ? null : scoreByPlayerId.get(slot.playerId!);
    const points = isEmpty
      ? EMPTY_SLOT_POINTS
      : (score?.pointsTotal ?? 0);

    return {
      id: slot.id,
      slotIndex: slot.slotIndex,
      slotPosition: slot.slotPosition,
      playerName: slot.player?.name ?? null,
      playerId: slot.playerId,
      isEmpty,
      points,
    };
  });

  // Bench: squad players not in the starting lineup
  const lineupPlayerIds = new Set(
    slots
      .filter((s) => s.playerId !== null)
      .map((s) => s.playerId as number),
  );

  const bench: BenchPlayer[] = (squadData?.squad ?? [])
    .filter((sp) => !lineupPlayerIds.has(sp.playerId))
    .map((sp) => ({
      id: sp.id,
      playerId: sp.playerId,
      playerName: sp.player.name,
      positionLabel: slotPositionLabel(
        (() => {
          switch (sp.player.positionId) {
            case 24: return "GK";
            case 25: return "DEF";
            case 26: return "MID";
            case 27: return "FWD";
            default: return "MID";
          }
        })(),
      ),
    }));

  return (
    <LineupClient
      slots={slots}
      bench={bench}
      formation={lineup.formation}
      totalPoints={roundScore.pointsTotal}
      teamName={roundScore.managerTeam.name}
    />
  );
}
