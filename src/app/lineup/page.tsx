import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, slotPositionLabel } from "@/lib/fantasy/format";
import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";

export const dynamic = "force-dynamic";

export default async function LineupPage() {
  const detail = await getManagerRoundDetail();
  const slots = detail?.lineup?.slots ?? [];

  return (
    <>
      <h1>Diziliş</h1>
      <p className="subtitle">
        İlk on bir (MVP için 4-4-2). Boş pozisyonlar {EMPTY_SLOT_POINTS} puan.
      </p>

      {!detail || slots.length === 0 ? (
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz diziliş oluşturulmadı. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 8px" }}>Mevki</th>
                <th style={{ padding: "6px 8px" }}>Oyuncu</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Puan</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const isEmpty = slot.playerId === null || slot.player === null;
                const points = isEmpty
                  ? EMPTY_SLOT_POINTS
                  : (detail.scoreByPlayerId.get(slot.playerId!)?.pointsTotal ??
                    0);
                return (
                  <tr
                    key={slot.id}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "6px 8px" }}>
                      {slotPositionLabel(slot.slotPosition)}
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        color: isEmpty ? "var(--muted)" : "var(--text)",
                      }}
                    >
                      {isEmpty
                        ? "Boş pozisyon"
                        : (slot.player?.name ?? `Oyuncu #${slot.playerId}`)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      {formatPoints(points)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--border)" }}>
                <td
                  colSpan={2}
                  style={{ padding: "6px 8px", fontWeight: 700 }}
                >
                  Toplam
                </td>
                <td
                  style={{
                    padding: "6px 8px",
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatPoints(detail.roundScore.pointsTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
