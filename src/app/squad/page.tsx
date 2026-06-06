import { getManagerSquad } from "@/lib/fantasy/queries";
import { formatPoints, formatTL, positionIdLabel } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function SquadPage() {
  const data = await getManagerSquad();

  return (
    <>
      <h1>Kadrom</h1>
      <p className="subtitle">Mevki bazında kadro oyuncuların.</p>

      {!data || data.squad.length === 0 ? (
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz kadroya oyuncu eklenmedi. Veri Senkronizasyonu sayfasından
            test menajeri oluşturabilirsin.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <span className="tag">Takım</span>
            <p>
              <strong>{data.team.name}</strong> · {data.squad.length} oyuncu ·
              Bütçe: {formatTL(data.team.budget)}
            </p>
          </div>

          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "6px 8px" }}>Oyuncu</th>
                  <th style={{ padding: "6px 8px" }}>Mevki</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>
                    Son hafta puanı
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.squad.map((sp) => (
                  <tr
                    key={sp.id}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "6px 8px" }}>
                      {sp.player.name ?? `Oyuncu #${sp.playerId}`}
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {positionIdLabel(sp.player.positionId)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      {formatPoints(data.pointsByPlayerId.get(sp.playerId) ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
