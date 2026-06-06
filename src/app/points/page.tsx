import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, slotPositionLabel } from "@/lib/fantasy/format";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const detail = await getManagerRoundDetail();
  const slots = detail?.lineup?.slots ?? [];

  return (
    <>
      <h1>Puanlar</h1>
      <p className="subtitle">Oyuncu bazında hafta puanı dökümü.</p>

      {!detail || slots.length === 0 ? (
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz puan dökümü yok. Veri Senkronizasyonu sayfasından test menajer
            puanını oluşturabilirsin.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <span className="tag">Toplam</span>
            <p style={{ fontSize: 22, fontWeight: 700, margin: "4px 0" }}>
              {formatPoints(detail.roundScore.pointsTotal)} puan
            </p>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Diziliş: {formatPoints(detail.roundScore.pointsLineup)} · Boş
              pozisyonlar: {formatPoints(detail.roundScore.pointsEmptySlots)}
            </p>
          </div>

          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "6px 8px" }}>Oyuncu</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>
                    Reyting
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Dk.</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Gol</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Asist</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Kart</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const isEmpty = slot.playerId === null;
                  const score = isEmpty
                    ? null
                    : detail.scoreByPlayerId.get(slot.playerId!);
                  return (
                    <tr
                      key={slot.id}
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "6px 8px" }}>
                        {isEmpty ? (
                          <span style={{ color: "var(--muted)" }}>
                            Boş pozisyon ({slotPositionLabel(slot.slotPosition)})
                          </span>
                        ) : (
                          (slot.player?.name ?? `Oyuncu #${slot.playerId}`)
                        )}
                      </td>
                      {isEmpty || !score ? (
                        <>
                          <td colSpan={5} />
                          <td
                            style={{ padding: "6px 8px", textAlign: "right" }}
                          >
                            {formatPoints(isEmpty ? EMPTY_SLOT_POINTS : 0)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>
                            {formatPoints(score.pointsRating)}
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>
                            {formatPoints(score.pointsMinutes)}
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>
                            {formatPoints(score.pointsGoals)}
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>
                            {formatPoints(score.pointsAssists)}
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>
                            {formatPoints(score.pointsCards)}
                          </td>
                          <td
                            style={{
                              padding: "6px 8px",
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {formatPoints(score.pointsTotal)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
