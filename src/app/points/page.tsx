import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, slotPositionLabel, positionIdLabel } from "@/lib/fantasy/format";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";

export const dynamic = "force-dynamic";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function PointsPage() {
  const detail = await getManagerRoundDetail();
  const slots = detail?.lineup?.slots ?? [];

  if (!detail || slots.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Puanlar</h1>
          <p className="page-subtitle">Oyuncu bazında hafta puanı dökümü.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
            Henüz puan dökümü yok. Veri Senkronizasyonu sayfasından test menajer
            puanını oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  const totalPoints = detail.roundScore.pointsTotal;
  const lineupPoints = detail.roundScore.pointsLineup;
  const emptyPenalty = detail.roundScore.pointsEmptySlots;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Puanlar</h1>
        <p className="page-subtitle">
          {detail.roundScore.managerTeam.name} · Haftalık puan dökümü
        </p>
      </div>

      {/* Summary */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Toplam Puan</div>
          <div className="stat-value">{totalPoints}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Diziliş</div>
          <div className="stat-value" style={{ color: "var(--accent-lime)" }}>
            {formatPoints(lineupPoints)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Boş Pozisyon</div>
          <div
            className="stat-value"
            style={{ color: emptyPenalty < 0 ? "var(--accent-red)" : "var(--text-muted)" }}
          >
            {formatPoints(emptyPenalty)}
          </div>
        </div>
      </div>

      {/* Per-player breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {slots.map((slot) => {
          const isEmpty = slot.playerId === null;
          const score = isEmpty ? null : detail.scoreByPlayerId.get(slot.playerId!);
          const playerName = slot.player?.name ?? null;
          const total = isEmpty ? EMPTY_SLOT_POINTS : (score?.pointsTotal ?? 0);

          const events: Array<{ label: string; pts: number }> = [];

          if (!isEmpty && score) {
            if (score.pointsRating !== 0)
              events.push({ label: "Reyting", pts: score.pointsRating });
            if (score.pointsMinutes !== 0)
              events.push({ label: "Dakika", pts: score.pointsMinutes });
            if (score.pointsGoals !== 0)
              events.push({ label: `${score.goals + score.penaltyGoals} Gol`, pts: score.pointsGoals });
            if (score.pointsAssists !== 0)
              events.push({ label: `${score.assists} Asist`, pts: score.pointsAssists });
            if (score.pointsCards !== 0) {
              if (score.yellowCards > 0)
                events.push({ label: "Sarı Kart", pts: score.yellowCards * -1 });
              if (score.redCards > 0)
                events.push({ label: "Kırmızı Kart", pts: score.redCards * -4 });
            }
          }

          return (
            <div key={slot.id} className="points-player-card">
              <div className="points-player-header">
                <div className="points-player-avatar">
                  {isEmpty ? "!" : initials(playerName)}
                </div>
                <div className="points-player-name">
                  {isEmpty ? (
                    <span style={{ color: "var(--text-muted)" }}>
                      Boş Pozisyon ({slotPositionLabel(slot.slotPosition)})
                    </span>
                  ) : (
                    <>
                      {playerName ?? `Oyuncu #${slot.playerId}`}
                      {slot.player && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {positionIdLabel(slot.player.positionId)}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div
                  className={`points-player-total${total < 0 ? " negative" : ""}`}
                >
                  {formatPoints(total)}
                </div>
              </div>

              {/* Breakdown events */}
              {(events.length > 0 || isEmpty) && (
                <div className="points-breakdown">
                  {isEmpty && (
                    <span className="points-event negative">
                      Boş Slot {formatPoints(EMPTY_SLOT_POINTS)}
                    </span>
                  )}
                  {events.map((ev, i) => (
                    <span
                      key={i}
                      className={`points-event${ev.pts > 0 ? " positive" : ev.pts < 0 ? " negative" : ""}`}
                    >
                      {ev.label} {formatPoints(ev.pts)}
                    </span>
                  ))}
                  {!isEmpty && score && events.length === 0 && (
                    <span className="points-event">Maça katılmadı · 0 puan</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
