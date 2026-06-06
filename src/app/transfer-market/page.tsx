import { getTransferMarketData } from "@/lib/transfer/market";
import { formatTL, positionIdLabel } from "@/lib/fantasy/format";

import { buyPlayerAction, sellPlayerAction } from "./actions";

export const dynamic = "force-dynamic";

/** Turkish banner text for the result of the last buy/sell action. */
function bannerFor(
  msg: string | undefined,
  ad: string | undefined,
): { text: string; tone: "ok" | "warn" } | null {
  if (!msg) return null;
  const name = ad ?? "Oyuncu";
  switch (msg) {
    case "bought":
      return { text: `${name} kadrona katıldı.`, tone: "ok" };
    case "sold":
      return { text: `${name} satıldı ve pazara geri döndü.`, tone: "ok" };
    case "already_owned":
      return { text: `${name} zaten kadronda.`, tone: "warn" };
    case "owned_by_other":
      return {
        text: `${name} bu ligde başka bir menajere ait.`,
        tone: "warn",
      };
    case "insufficient_budget":
      return { text: `${name} için bütçen yetersiz.`, tone: "warn" };
    case "not_owned":
      return { text: `${name} kadronda bulunamadı.`, tone: "warn" };
    case "not_found":
      return { text: "Oyuncu bulunamadı.", tone: "warn" };
    case "no_team":
      return { text: "Önce bir menajer takımı oluşturulmalı.", tone: "warn" };
    default:
      return { text: "İşlem tamamlanamadı.", tone: "warn" };
  }
}

export default async function TransferMarketPage({
  searchParams,
}: {
  searchParams: { msg?: string; ad?: string };
}) {
  const data = await getTransferMarketData();
  const banner = bannerFor(searchParams.msg, searchParams.ad);

  if (!data) {
    return (
      <>
        <h1>Transfer Pazarı</h1>
        <p className="subtitle">Oyuncuları TL ile al ve sat.</p>
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz bir menajer takımı yok. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  const { team, squad, available } = data;

  return (
    <>
      <h1>Transfer Pazarı</h1>
      <p className="subtitle">Oyuncuları TL ile al ve sat.</p>

      {banner ? (
        <div
          className="card"
          style={{
            borderColor:
              banner.tone === "ok" ? "var(--accent, #2e7d32)" : "#9a6700",
          }}
        >
          <p style={{ margin: 0 }}>{banner.text}</p>
        </div>
      ) : null}

      <div className="card">
        <span className="tag">Takım</span>
        <p>
          <strong>{team.name}</strong> · Bütçe:{" "}
          <strong>{formatTL(team.budget)}</strong> · Kadro: {squad.length} oyuncu
        </p>
      </div>

      <div className="card">
        <span className="tag">Kadrom</span>
        {squad.length === 0 ? (
          <p>Kadronda oyuncu yok. Aşağıdan oyuncu satın alabilirsin.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 8px" }}>Oyuncu</th>
                <th style={{ padding: "6px 8px" }}>Takım</th>
                <th style={{ padding: "6px 8px" }}>Mevki</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>
                  Piyasa değeri
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((sp) => (
                <tr key={sp.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 8px" }}>
                    {sp.player.name ?? `Oyuncu #${sp.playerId}`}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {sp.player.currentTeam?.name ?? "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {positionIdLabel(sp.player.positionId)}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    {formatTL(sp.player.currentMarketValue)}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    <form action={sellPlayerAction}>
                      <input type="hidden" name="playerId" value={sp.playerId} />
                      <button type="submit" style={buttonStyle}>
                        Sat
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <span className="tag">Alınabilir Oyuncular</span>
        {available.length === 0 ? (
          <p>Pazarda alınabilir oyuncu kalmadı.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 8px" }}>Oyuncu</th>
                <th style={{ padding: "6px 8px" }}>Takım</th>
                <th style={{ padding: "6px 8px" }}>Mevki</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>
                  Piyasa değeri
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {available.map((p) => {
                const affordable = team.budget >= p.currentMarketValue;
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "6px 8px" }}>
                      {p.name ?? `Oyuncu #${p.id}`}
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {p.currentTeam?.name ?? "—"}
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {positionIdLabel(p.positionId)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      {formatTL(p.currentMarketValue)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      <form action={buyPlayerAction}>
                        <input type="hidden" name="playerId" value={p.id} />
                        <button
                          type="submit"
                          disabled={!affordable}
                          title={affordable ? undefined : "Bütçe yetersiz"}
                          style={{
                            ...buttonStyle,
                            cursor: affordable ? "pointer" : "not-allowed",
                            opacity: affordable ? 1 : 0.5,
                          }}
                        >
                          Al
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const buttonStyle = {
  padding: "4px 12px",
  borderRadius: 6,
  border: "1px solid var(--border, #333)",
  cursor: "pointer",
} as const;
