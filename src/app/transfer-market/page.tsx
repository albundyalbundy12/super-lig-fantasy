import { getTransferMarketData } from "@/lib/transfer/market";
import { formatTL, positionIdLabel } from "@/lib/fantasy/format";
import { buyPlayerAction, sellPlayerAction } from "./actions";

export const dynamic = "force-dynamic";

function bannerFor(
  msg: string | undefined,
  ad: string | undefined,
): { text: string; tone: "ok" | "warn" } | null {
  if (!msg) return null;
  const name = ad ?? "Oyuncu";
  switch (msg) {
    case "bought":           return { text: `${name} kadrona katıldı.`, tone: "ok" };
    case "sold":             return { text: `${name} satıldı ve pazara geri döndü.`, tone: "ok" };
    case "already_owned":   return { text: `${name} zaten kadronda.`, tone: "warn" };
    case "owned_by_other":  return { text: `${name} bu ligde başka bir menajere ait.`, tone: "warn" };
    case "insufficient_budget": return { text: `${name} için bütçen yetersiz.`, tone: "warn" };
    case "not_owned":       return { text: `${name} kadronda bulunamadı.`, tone: "warn" };
    case "not_found":       return { text: "Oyuncu bulunamadı.", tone: "warn" };
    case "no_team":         return { text: "Önce bir menajer takımı oluşturulmalı.", tone: "warn" };
    default:                return { text: "İşlem tamamlanamadı.", tone: "warn" };
  }
}

function positionClass(positionId: number | null): string {
  switch (positionId) {
    case 24: return "pos-chip pos-gk";
    case 25: return "pos-chip pos-def";
    case 26: return "pos-chip pos-mid";
    case 27: return "pos-chip pos-fwd";
    default: return "pos-chip pos-mid";
  }
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
        <div className="page-header">
          <h1 className="page-title">Transfer Pazarı</h1>
          <p className="page-subtitle">Oyuncuları TL ile al ve sat.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
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
      <div className="page-header">
        <h1 className="page-title">Transfer Pazarı</h1>
        <p className="page-subtitle">{team.name} · Oyuncu al ve sat</p>
      </div>

      {/* Action banner */}
      {banner && (
        <div className={`alert alert-${banner.tone === "ok" ? "ok" : "warn"}`}>
          {banner.tone === "ok" ? "✓" : "⚠"} {banner.text}
        </div>
      )}

      {/* Budget strip */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Bütçe</div>
          <div className="stat-value" style={{ fontSize: 15, paddingTop: 6 }}>
            {formatTL(team.budget)}
          </div>
          <div className="stat-sub">mevcut</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kadro</div>
          <div className="stat-value">{squad.length}</div>
          <div className="stat-sub">oyuncu</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pazarda</div>
          <div className="stat-value">{available.length}</div>
          <div className="stat-sub">oyuncu</div>
        </div>
      </div>

      {/* My squad — sell */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Kadrom</div>
        </div>
        {squad.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
            Kadronda oyuncu yok. Aşağıdan oyuncu satın alabilirsin.
          </p>
        ) : (
          <div>
            {squad.map((sp) => {
              const name = sp.player.name ?? `Oyuncu #${sp.playerId}`;
              return (
                <div key={sp.id} className="player-row">
                  <div className="player-row-avatar">{initials(name)}</div>
                  <div className="player-row-info">
                    <div className="player-row-name">{name}</div>
                    <div className="player-row-meta">
                      {sp.player.currentTeam?.name ?? "—"} ·{" "}
                      <span className={positionClass(sp.player.positionId)}>
                        {positionIdLabel(sp.player.positionId)}
                      </span>
                    </div>
                  </div>
                  <div className="player-row-value">
                    {formatTL(sp.player.currentMarketValue)}
                  </div>
                  <div className="player-row-action">
                    <form action={sellPlayerAction}>
                      <input type="hidden" name="playerId" value={sp.playerId} />
                      <button type="submit" className="btn btn-sm btn-danger">
                        Sat
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available players — buy */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Alınabilir Oyuncular</div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {available.length} oyuncu
          </span>
        </div>
        {available.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
            Pazarda alınabilir oyuncu kalmadı.
          </p>
        ) : (
          <div>
            {available.map((p) => {
              const affordable = team.budget >= p.currentMarketValue;
              const name = p.name ?? `Oyuncu #${p.id}`;
              return (
                <div key={p.id} className="player-row">
                  <div className="player-row-avatar">{initials(name)}</div>
                  <div className="player-row-info">
                    <div className="player-row-name">{name}</div>
                    <div className="player-row-meta">
                      {p.currentTeam?.name ?? "—"} ·{" "}
                      <span className={positionClass(p.positionId)}>
                        {positionIdLabel(p.positionId)}
                      </span>
                    </div>
                  </div>
                  <div className="player-row-value">
                    <span
                      style={{
                        color: affordable
                          ? "var(--text-secondary)"
                          : "var(--accent-red)",
                      }}
                    >
                      {formatTL(p.currentMarketValue)}
                    </span>
                  </div>
                  <div className="player-row-action">
                    <form action={buyPlayerAction}>
                      <input type="hidden" name="playerId" value={p.id} />
                      <button
                        type="submit"
                        disabled={!affordable}
                        className="btn btn-sm btn-gold"
                        title={affordable ? undefined : "Bütçe yetersiz"}
                      >
                        Al
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
