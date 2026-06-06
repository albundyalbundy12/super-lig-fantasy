import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, slotPositionLabel } from "@/lib/fantasy/format";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";

export const dynamic = "force-dynamic";

type Part = { label: string; points: number };

/** Build the visible per-player point breakdown chips from a player score. */
function breakdown(score: {
  pointsGoals: number;
  pointsAssists: number;
  pointsMinutes: number;
  pointsRating: number;
  pointsCards: number;
}): Part[] {
  const parts: Part[] = [];
  if (score.pointsGoals !== 0) parts.push({ label: "Gol", points: score.pointsGoals });
  if (score.pointsAssists !== 0)
    parts.push({ label: "Asist", points: score.pointsAssists });
  if (score.pointsMinutes !== 0)
    parts.push({ label: "Dakika", points: score.pointsMinutes });
  if (score.pointsRating !== 0)
    parts.push({ label: "Rating", points: score.pointsRating });
  if (score.pointsCards !== 0)
    parts.push({ label: "Kart", points: score.pointsCards });
  return parts;
}

function ptsClass(points: number): string {
  if (points > 0) return "pts pts-pos";
  if (points < 0) return "pts pts-neg";
  return "pts pts-zero";
}

export default async function PointsPage() {
  const detail = await getManagerRoundDetail();
  const slots = detail?.lineup?.slots ?? [];

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Performans</span>
        <h1>Puanlar</h1>
        <p className="page-sub">Oyuncu bazında hafta puanı dökümü.</p>
      </div>

      {!detail || slots.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              📊
            </div>
            <p>
              Henüz puan dökümü yok. Veri Senkronizasyonu sayfasından test
              menajer puanını oluşturabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            <div className="stat-card is-gold">
              <div className="stat-label">Toplam Puan</div>
              <div className="stat-value">
                {formatPoints(detail.roundScore.pointsTotal)}
              </div>
              <div className="stat-sub">Bu hafta</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Diziliş</div>
              <div className="stat-value">
                {formatPoints(detail.roundScore.pointsLineup)}
              </div>
              <div className="stat-sub">Oyunculardan</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Boş Pozisyon</div>
              <div className="stat-value">
                {formatPoints(detail.roundScore.pointsEmptySlots)}
              </div>
              <div className="stat-sub">Cezalar</div>
            </div>
          </div>

          <div className="card">
            <span className="tag">Oyuncu Dökümü</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {slots.map((slot) => {
                const isEmpty = slot.playerId === null;
                const score = isEmpty
                  ? null
                  : detail.scoreByPlayerId.get(slot.playerId!);
                const total = isEmpty
                  ? EMPTY_SLOT_POINTS
                  : (score?.pointsTotal ?? 0);
                const parts = score ? breakdown(score) : [];

                return (
                  <div
                    key={slot.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 4px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {isEmpty
                          ? `Boş pozisyon (${slotPositionLabel(slot.slotPosition)})`
                          : (slot.player?.name ?? `Oyuncu #${slot.playerId}`)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        {isEmpty ? (
                          <span className="pts pts-neg">
                            Boş Slot {formatPoints(EMPTY_SLOT_POINTS)}
                          </span>
                        ) : parts.length === 0 ? (
                          <span
                            style={{ color: "var(--muted)", fontSize: 13 }}
                          >
                            Bu hafta puan üretecek olay yok.
                          </span>
                        ) : (
                          parts.map((p) => (
                            <span key={p.label} className={ptsClass(p.points)}>
                              {p.label} {formatPoints(p.points)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        color:
                          total > 0
                            ? "#0c6b3b"
                            : total < 0
                              ? "#b4321f"
                              : "var(--muted)",
                      }}
                    >
                      {formatPoints(total)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
