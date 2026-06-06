import { getLeagueTable } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function TablePage() {
  const rows = await getLeagueTable();

  return (
    <>
      <h1>Lig Tablosu</h1>
      <p className="subtitle">Özel ligindeki menajer sıralaması.</p>

      {rows.length === 0 ? (
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz lige menajer eklenmedi. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 8px" }}>#</th>
                <th style={{ padding: "6px 8px" }}>Takım</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>
                  Hafta
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>
                  Toplam
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>
                  Kadro değeri
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Bütçe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.teamId}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "6px 8px" }}>{index + 1}</td>
                  <td style={{ padding: "6px 8px" }}>
                    {row.teamName}
                    <span style={{ color: "var(--muted)" }}>
                      {" "}
                      · {row.managerName}
                    </span>
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    {formatPoints(row.roundPoints)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatPoints(row.pointsTotal)}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    {formatTL(row.squadValue)}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    {formatTL(row.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
