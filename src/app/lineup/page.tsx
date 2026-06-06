import { getManagerRoundDetail, getManagerSquad } from "@/lib/fantasy/queries";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";
import {
  Pitch,
  type BenchPlayer,
  type PitchPlayer,
} from "@/components/pitch";
import type { PositionCat } from "@/components/formations";

export const dynamic = "force-dynamic";

function slotCat(code: string): PositionCat {
  switch (code) {
    case "GK":
    case "DEF":
    case "MID":
    case "FWD":
      return code;
    default:
      return "MID";
  }
}

function positionIdCat(positionId: number | null): PositionCat {
  switch (positionId) {
    case 24:
      return "GK";
    case 25:
      return "DEF";
    case 26:
      return "MID";
    case 27:
      return "FWD";
    default:
      return "MID";
  }
}

export default async function LineupPage() {
  const [detail, squadData] = await Promise.all([
    getManagerRoundDetail(),
    getManagerSquad(),
  ]);
  const slots = detail?.lineup?.slots ?? [];

  const startingXI: PitchPlayer[] = slots
    .filter((s) => s.playerId !== null && s.player !== null)
    .map((s) => ({
      playerId: s.playerId!,
      name: s.player?.name ?? `Oyuncu #${s.playerId}`,
      cat: slotCat(s.slotPosition),
      points: detail?.scoreByPlayerId.get(s.playerId!)?.pointsTotal ?? 0,
    }));

  const squad: BenchPlayer[] = (squadData?.squad ?? []).map((sp) => ({
    playerId: sp.playerId,
    name: sp.player.name ?? `Oyuncu #${sp.playerId}`,
    cat: positionIdCat(sp.player.positionId),
  }));

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Taktik</span>
        <h1>Diziliş</h1>
        <p className="page-sub">
          İlk on birini sahada kur. Boş pozisyonlar her biri {EMPTY_SLOT_POINTS}{" "}
          puan risk taşır. Formasyon seçimi taktikseldir, puanı etkilemez.
        </p>
      </div>

      {!detail || slots.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              📋
            </div>
            <p>
              Henüz diziliş oluşturulmadı. Veri Senkronizasyonu sayfasından test
              menajeri oluşturabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <Pitch startingXI={startingXI} squad={squad} />
      )}
    </>
  );
}
