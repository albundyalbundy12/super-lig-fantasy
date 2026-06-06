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
    case "bought":               return { text: `${name} kadrona katıldı.`,                        tone: "ok"   };
    case "sold":                 return { text: `${name} satıldı ve pazara geri döndü.`,           tone: "ok"   };
    case "already_owned":        return { text: `${name} zaten kadronda.`,                         tone: "warn" };
    case "owned_by_other":       return { text: `${name} bu ligde başka bir menajere ait.`,        tone: "warn" };
    case "insufficient_budget":  return { text: `${name} için bütçen yetersiz.`,                   tone: "warn" };
    case "not_owned":            return { text: `${name} kadronda bulunamadı.`,                    tone: "warn" };
    case "not_found":            return { text: "Oyuncu bulunamadı.",                              tone: "warn" };
    case "no_team":              return { text: "Önce bir menajer takımı oluşturulmalı.",          tone: "warn" };
    default:                     return { text: "İşlem tamamlanamadı.",                            tone: "warn" };
  }
}

function posClass(positionId: number | null): string {
  switch (positionId) {
    case 24: return "pos pos-gk";
    case 25: return "pos pos-def";
    case 26: return "pos pos-mid";
    case 27: return "pos pos-fwd";
    default: return "pos pos-mid";
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
  const data   = await getTransferMarketData();
  const banner = bannerFor(searchParams.msg, searchParams.ad);

  if (!data) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Transfer Pazarı</div>
          <div className="page-subtitle">Oyuncuları TL ile al ve sat.</div>
        </div>
        <div className="section">
          <div className="card" style={{ padding: "20px", color: "var(--t2)", fontSize: 13 }}>
            Henüz bir menajer takımı yok. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </div>
        </div>
      </>
    );
  }

  const { team, squad, available } = data;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">Transfer Pazarı</div>
        <div className="page-subtitle">{team.name} · Oyuncu al ve sat</div>
      </div>

      {/* Action banner */}
      {banner && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className={`alert ${banner.tone === "ok" ? "alert-ok" : "alert-warn"}`}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              {banner.tone === "ok" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.667 1.73-3L13.73 4c-.77-1.333-2.69-1.333-3.46 0L3.34 16c-.77 1.333.19 3 1.73 3z" />
              )}
            </svg>
            <span>{banner.text}</span>
          </div>
        </div>
      )}

      {/* Budget stat strip */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="stat-grid cols-3">
          <div className="stat-cell">
            <div className="stat-num medium">{formatTL(team.budget)}</div>
            <div className="stat-label">Bütçe</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{squad.length}</div>
            <div className="stat-label">Kadro</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{available.length}</div>
            <div className="stat-label">Pazarda</div>
          </div>
        </div>
      </div>

      {/* My squad — sell */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-header">
          <div className="section-title">Kadrom</div>
          <div className="section-sub">{squad.length} oyuncu</div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {squad.length === 0 ? (
            <div style={{ padding: "20px 16px", color: "var(--t2)", fontSize: 13 }}>
              Kadronda oyuncu yok. Aşağıdan oyuncu satın alabilirsin.
            </div>
          ) : (
            <div style={{ padding: "0 16px" }}>
              {squad.map((sp) => {
                const name = sp.player.name ?? `Oyuncu #${sp.playerId}`;
                return (
                  <div key={sp.id} className="player-row">
                    <div className="avatar sm">{initials(name)}</div>
                    <div className="player-info">
                      <div className="player-name">{name}</div>
                      <div className="player-meta">
                        {sp.player.currentTeam?.name ?? "—"} ·{" "}
                        <span className={posClass(sp.player.positionId)}>
                          {positionIdLabel(sp.player.positionId)}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t2)", flexShrink: 0 }}>
                      {formatTL(sp.player.currentMarketValue)}
                    </div>
                    <form action={sellPlayerAction}>
                      <input type="hidden" name="playerId" value={sp.playerId} />
                      <button
                        type="submit"
                        style={{
                          background: "var(--red-soft)",
                          color: "var(--red)",
                          border: "1px solid rgba(214,64,69,0.3)",
                          borderRadius: "var(--r-sm)",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          cursor: "pointer",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          flexShrink: 0,
                        }}
                      >
                        Sat
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Available players — buy */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Alınabilir Oyuncular</div>
          <div className="section-sub">{available.length} oyuncu</div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {available.length === 0 ? (
            <div style={{ padding: "20px 16px", color: "var(--t2)", fontSize: 13 }}>
              Pazarda alınabilir oyuncu kalmadı.
            </div>
          ) : (
            <div style={{ padding: "0 16px" }}>
              {available.map((p) => {
                const affordable = team.budget >= p.currentMarketValue;
                const name = p.name ?? `Oyuncu #${p.id}`;
                return (
                  <div key={p.id} className="player-row">
                    <div className="avatar sm">{initials(name)}</div>
                    <div className="player-info">
                      <div className="player-name">{name}</div>
                      <div className="player-meta">
                        {p.currentTeam?.name ?? "—"} ·{" "}
                        <span className={posClass(p.positionId)}>
                          {positionIdLabel(p.positionId)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: affordable ? "var(--t2)" : "var(--red)",
                        flexShrink: 0,
                        fontWeight: affordable ? 400 : 600,
                      }}
                    >
                      {formatTL(p.currentMarketValue)}
                    </div>
                    <form action={buyPlayerAction}>
                      <input type="hidden" name="playerId" value={p.id} />
                      <button
                        type="submit"
                        disabled={!affordable}
                        title={affordable ? undefined : "Bütçe yetersiz"}
                        style={{
                          background: affordable ? "var(--gold-glow)" : "var(--bg-raised)",
                          color: affordable ? "var(--gold)" : "var(--t3)",
                          border: `1px solid ${affordable ? "rgba(201,162,39,0.4)" : "var(--b1)"}`,
                          borderRadius: "var(--r-sm)",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          cursor: affordable ? "pointer" : "not-allowed",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          flexShrink: 0,
                          opacity: affordable ? 1 : 0.5,
                        }}
                      >
                        Al
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
