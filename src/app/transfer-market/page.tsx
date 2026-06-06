import { getTransferMarketData } from "@/lib/transfer/market";
import { formatTL, positionIdLabel } from "@/lib/fantasy/format";

import { buyPlayerAction, sellPlayerAction } from "./actions";

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

export const dynamic = "force-dynamic";

export default async function TransferMarketPage({
  searchParams,
}: {
  searchParams: { msg?: string; ad?: string };
}) {
  const data = await getTransferMarketData();
  const banner = bannerFor(searchParams.msg, searchParams.ad);

  const header = (
    <div className="page-header">
      <span className="page-eyebrow">Pazar</span>
      <h1>Transfer Pazarı</h1>
      <p className="page-sub">Oyuncuları TL ile akıllıca al ve sat.</p>
    </div>
  );

  if (!data) {
    return (
      <>
        {header}
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              💱
            </div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>
              Transfer Pazarı yakında aktif olacak
            </p>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>
              Henüz bir menajer takımı yok. Veri Senkronizasyonu sayfasından
              test menajeri oluşturabilirsin.
            </p>
          </div>
        </div>
      </>
    );
  }

  const { team, squad, available } = data;

  return (
    <>
      {header}

      {banner ? (
        <div className={`banner ${banner.tone === "ok" ? "banner-ok" : "banner-warn"}`}>
          {banner.text}
        </div>
      ) : null}

      <div className="grid grid-3">
        <div className="stat-card">
          <div className="stat-label">Takım</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {team.name}
          </div>
          <div className="stat-sub">{squad.length} oyuncu</div>
        </div>
        <div className="stat-card is-gold">
          <div className="stat-label">Bütçe</div>
          <div className="stat-value">{formatTL(team.budget)}</div>
          <div className="stat-sub">Transfer için</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pazarda</div>
          <div className="stat-value">{available.length}</div>
          <div className="stat-sub">Alınabilir oyuncu</div>
        </div>
      </div>

      <div className="card">
        <span className="tag">Kadrom</span>
        {squad.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Kadronda oyuncu yok. Aşağıdan oyuncu satın alabilirsin.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Oyuncu</th>
                <th>Takım</th>
                <th>Mevki</th>
                <th className="num">Piyasa Değeri</th>
                <th className="num">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((sp) => (
                <tr key={sp.id}>
                  <td style={{ fontWeight: 600 }}>
                    {sp.player.name ?? `Oyuncu #${sp.playerId}`}
                  </td>
                  <td>{sp.player.currentTeam?.name ?? "—"}</td>
                  <td>{positionIdLabel(sp.player.positionId)}</td>
                  <td className="num">
                    {formatTL(sp.player.currentMarketValue)}
                  </td>
                  <td className="num">
                    <form action={sellPlayerAction}>
                      <input type="hidden" name="playerId" value={sp.playerId} />
                      <button type="submit" className="btn btn-ghost btn-sm">
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
          <p style={{ color: "var(--muted)" }}>
            Pazarda alınabilir oyuncu kalmadı.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Oyuncu</th>
                <th>Takım</th>
                <th>Mevki</th>
                <th className="num">Piyasa Değeri</th>
                <th className="num">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {available.map((p) => {
                const affordable = team.budget >= p.currentMarketValue;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      {p.name ?? `Oyuncu #${p.id}`}
                    </td>
                    <td>{p.currentTeam?.name ?? "—"}</td>
                    <td>{positionIdLabel(p.positionId)}</td>
                    <td className="num">{formatTL(p.currentMarketValue)}</td>
                    <td className="num">
                      <form action={buyPlayerAction}>
                        <input type="hidden" name="playerId" value={p.id} />
                        <button
                          type="submit"
                          disabled={!affordable}
                          title={affordable ? undefined : "Bütçe yetersiz"}
                          className="btn btn-primary btn-sm"
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
