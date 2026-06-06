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
          <div className="page-title">Puanlar</div>
          <div className="page-subtitle">Oyuncu bazında hafta puanı dökümü.</div>
        </div>
        <div className="section">
          <div className="card" style={{ padding: "20px", color: "var(--t2)", fontSize: 13 }}>
            Henüz puan dökümü yok. Veri Senkronizasyonu sayfasından test menajer
            puanını oluşturabilirsin.
          </div>
        </div>
      </>
    );
  }

  const totalPoints  = detail.roundScore.pointsTotal;
  const lineupPoints = detail.roundScore.pointsLineup;
  const emptyPenalty = detail.roundScore.pointsEmptySlots;
  const teamName     = detail.roundScore.managerTeam.name;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">Puanlar</div>
        <div className="page-subtitle">{teamName} · Haftalık puan dökümü</div>
      </div>

      {/* Summary stat strip */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="stat-grid cols-3">
          <div className="stat-cell">
            <div
              className="stat-num"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 800,
                color: totalPoints >= 0 ? "var(--gold)" : "var(--red)",
              }}
            >
              {totalPoints > 0 ? "+" : ""}{totalPoints}
            </div>
            <div className="stat-label">Toplam Puan</div>
          </div>
          <div className="stat-cell">
            <div
              className="stat-num"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 800,
                color: lineupPoints > 0 ? "var(--lime)" : "var(--t3)",
              }}
            >
              {formatPoints(lineupPoints)}
            </div>
            <div className="stat-label">Diziliş</div>
          </div>
          <div className="stat-cell">
            <div
              className="stat-num"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 800,
                color: emptyPenalty < 0 ? "var(--red)" : "var(--t3)",
              }}
            >
              {emptyPenalty < 0 ? formatPoints(emptyPenalty) : "—"}
            </div>
            <div className="stat-label">Boş Ceza</div>
          </div>
        </div>
      </div>

      {/* Per-player breakdown cards */}
      <div className="section">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slots.map((slot) => {
            const isEmpty = slot.playerId === null;
            const score   = isEmpty ? null : detail.scoreByPlayerId.get(slot.playerId!);
            const playerName = slot.player?.name ?? null;
            const total   = isEmpty ? EMPTY_SLOT_POINTS : (score?.pointsTotal ?? 0);

            const events: Array<{ label: string; pts: number }> = [];

            if (!isEmpty && score) {
              if (score.pointsMinutes !== 0)
                events.push({ label: "Dakika", pts: score.pointsMinutes });
              if (score.pointsRating !== 0)
                events.push({ label: "Reyting", pts: score.pointsRating });
              if (score.pointsGoals !== 0)
                events.push({ label: `${score.goals + score.penaltyGoals} Gol`, pts: score.pointsGoals });
              if (score.pointsAssists !== 0)
                events.push({ label: `${score.assists} Asist`, pts: score.pointsAssists });
              if (score.yellowCards > 0)
                events.push({ label: "Sarı Kart", pts: score.yellowCards * -1 });
              if (score.redCards > 0)
                events.push({ label: "Kırmızı Kart", pts: score.redCards * -4 });
            }

            const posLabel = slot.player
              ? positionIdLabel(slot.player.positionId)
              : slotPositionLabel(slot.slotPosition);

            return (
              <div key={slot.id} className="breakdown-card">
                <div className="breakdown-header">
                  {/* Avatar */}
                  <div className={`avatar${isEmpty ? "" : ""}`} style={isEmpty ? { background: "var(--red-soft)", color: "var(--red)" } : {}}>
                    {isEmpty ? "!" : initials(playerName)}
                  </div>

                  {/* Name + position */}
                  <div className="breakdown-name">
                    {isEmpty ? (
                      <span style={{ color: "var(--t2)" }}>
                        Boş Pozisyon
                      </span>
                    ) : (
                      <>{playerName ?? `Oyuncu #${slot.playerId}`}</>
                    )}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: 7,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--t3)",
                      }}
                    >
                      {posLabel}
                    </span>
                  </div>

                  {/* Total */}
                  <div
                    className={`breakdown-total${total < 0 ? " neg" : total === 0 ? " zero" : ""}`}
                  >
                    {total > 0 ? "+" : ""}{total}
                  </div>
                </div>

                {/* Event chips */}
                {(events.length > 0 || isEmpty || (!isEmpty && score && events.length === 0)) && (
                  <div className="breakdown-events">
                    {isEmpty && (
                      <span className="event-chip event-neg">
                        Boş Slot · {formatPoints(EMPTY_SLOT_POINTS)}
                      </span>
                    )}
                    {events.map((ev, i) => (
                      <span
                        key={i}
                        className={`event-chip ${ev.pts > 0 ? "event-pos" : ev.pts < 0 ? "event-neg" : "event-neu"}`}
                      >
                        {ev.label} · {formatPoints(ev.pts)}
                      </span>
                    ))}
                    {!isEmpty && score && events.length === 0 && (
                      <span className="event-chip event-neu">Maça katılmadı · 0 puan</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 20 }} />
    </>
  );
}
