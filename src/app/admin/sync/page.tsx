import { isSportmonksConfigured } from "@/lib/sportmonks";
import { getStoredSeasonReport } from "@/lib/sync";
import { getDbStatus, prisma } from "@/lib/db";
import {
  CURRENT_SEASON_ID,
  DENGELI_LEAGUE,
  DENGELI_SQUAD_COMPOSITION,
  DENGELI_SQUAD_SIZE,
  SUPER_LIG_LEAGUE_ID,
  TEST_FIXTURE_ID,
} from "@/config/constants";

import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";
import { formatTL } from "@/lib/fantasy/format";

import {
  calculatePlayerScoresAction,
  createTestManagerScoreAction,
  generateDengeliSquadsAction,
  syncCurrentSeasonAction,
  syncTestFixtureAction,
} from "./actions";

function formatDateTime(value: Date | null): string {
  if (!value) return "—";
  return value.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return value.toISOString().slice(0, 10);
}

export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  // Runs on the server. We only surface a boolean — never the token itself.
  const sportmonksReady = isSportmonksConfigured();
  const db = getDbStatus();

  const recentLogs = db.configured
    ? await prisma.apiSyncLog.findMany({
        where: { syncType: "fixture" },
        orderBy: { id: "desc" },
        take: 5,
      })
    : [];

  // Task 12: current-season report (season, rounds, fixtures + computed lock
  // times) read from our own DB after running the season sync.
  const seasonReport = db.configured
    ? await getStoredSeasonReport(CURRENT_SEASON_ID)
    : null;

  const recentScoringRuns = db.configured
    ? await prisma.scoringRun.findMany({
        orderBy: { id: "desc" },
        take: 5,
      })
    : [];

  // Dengeli Başlangıç demo league (Task 9): managers with their squads, so we
  // can show squad size, position coverage, squad value and remaining budget.
  const dengeliLeague = db.configured
    ? await prisma.fantasyLeague.findUnique({
        where: { inviteCode: DENGELI_LEAGUE.inviteCode },
        include: {
          managerTeams: {
            orderBy: { id: "asc" },
            include: {
              squadPlayers: {
                include: { player: { select: { positionId: true } } },
              },
            },
          },
        },
      })
    : null;

  const dengeliRows = (dengeliLeague?.managerTeams ?? []).map((team) => {
    const positionCounts: Record<string, number> = {};
    for (const slot of DENGELI_SQUAD_COMPOSITION) {
      positionCounts[slot.code] = team.squadPlayers.filter(
        (sp) => sp.player.positionId === slot.positionId,
      ).length;
    }
    return {
      teamId: team.id,
      teamName: team.name,
      squadCount: team.squadPlayers.length,
      positionCounts,
      squadValue: team.squadValue,
      remainingBudget: team.budget,
    };
  });

  const dengeliValues = dengeliRows.map((r) => r.squadValue);
  const dengeliSpread =
    dengeliValues.length > 0
      ? Math.max(...dengeliValues) - Math.min(...dengeliValues)
      : 0;

  // Latest test-manager round score (Task 6), with its lineup slots so we can
  // show the per-slot breakdown (empty slots, bank players) on the page.
  const latestManagerScore = db.configured
    ? await prisma.managerRoundScore.findFirst({
        orderBy: { id: "desc" },
        include: {
          managerTeam: {
            include: { squadPlayers: { include: { player: true } } },
          },
        },
      })
    : null;

  // Fetch the lineup for exactly this round (not merely the latest lineup), so
  // the breakdown always matches the round score shown above.
  const latestLineup = latestManagerScore
    ? await prisma.managerLineup.findUnique({
        where: {
          managerTeamId_roundId: {
            managerTeamId: latestManagerScore.managerTeamId,
            roundId: latestManagerScore.roundId,
          },
        },
        include: {
          slots: { orderBy: { slotIndex: "asc" }, include: { player: true } },
        },
      })
    : null;

  // Map internal player id -> this round's match points, for slot/bank display.
  // Fixtures store the raw Sportmonks round id, so resolve it from the round.
  const matchPointsByPlayerId = new Map<number, number>();
  if (latestManagerScore) {
    const round = await prisma.round.findUnique({
      where: { id: latestManagerScore.roundId },
      select: { sportmonksRoundId: true },
    });
    const fixturesInRound = round
      ? await prisma.fixture.findMany({
          where: { roundId: round.sportmonksRoundId },
          select: { id: true },
        })
      : [];
    const scores = await prisma.playerMatchScore.findMany({
      where: { fixtureId: { in: fixturesInRound.map((f) => f.id) } },
      select: { playerId: true, pointsTotal: true },
    });
    for (const s of scores) {
      matchPointsByPlayerId.set(
        s.playerId,
        (matchPointsByPlayerId.get(s.playerId) ?? 0) + s.pointsTotal,
      );
    }
  }

  const lineupPlayerIds = new Set(
    (latestLineup?.slots ?? [])
      .map((s) => s.playerId)
      .filter((id): id is number => id !== null),
  );
  const bankPlayers = (latestManagerScore?.managerTeam.squadPlayers ?? []).filter(
    (sp) => !lineupPlayerIds.has(sp.playerId),
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Veri Senkronizasyonu</h1>
        <p className="page-subtitle">
          Sportmonks senkronizasyonu ve puan hesaplama kontrol paneli.
        </p>
      </div>

      <div className="card">
        <span className="tag">Sportmonks API</span>
        <p>
          Token tanımlı:{" "}
          <strong>{sportmonksReady ? "evet" : "hayır"}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          <code>SPORTMONKS_API_TOKEN</code> değişkenini Replit Secrets içine
          ekle. Token yalnızca sunucu tarafında okunur ve tarayıcıya asla
          gönderilmez.
        </p>
      </div>

      <div className="card">
        <span className="tag">Veritabanı</span>
        <p>
          Bağlı: <strong>{db.configured ? "evet" : "hayır"}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{db.note}</p>
      </div>

      <div className="card">
        <span className="tag">Test Maçı</span>
        <p>
          Galatasaray vs Beşiktaş — fixture ID{" "}
          <strong>{TEST_FIXTURE_ID}</strong>.
        </p>
        <form action={syncTestFixtureAction}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={!sportmonksReady || !db.configured}
          >
            Test Maçını Senkronize Et
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Katılımcıları, olayları, dizilişleri ve diziliş detaylarını çeker,
          ardından veritabanına yazar. Tekrar çalıştırmak kopya oluşturmaz.
        </p>
      </div>

      <div className="card">
        <span className="tag">Güncel Sezon</span>
        <p>
          Süper Lig (lig <strong>{SUPER_LIG_LEAGUE_ID}</strong>) — güncel sezon
          ID <strong>{CURRENT_SEASON_ID}</strong>.
        </p>
        <form action={syncCurrentSeasonAction}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={!sportmonksReady || !db.configured}
          >
            Güncel Sezonu Senkronize Et
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Sezonu, haftalarını ve maçlarını çeker, ardından veritabanına yazar.
          Geçmiş test maçına dokunmaz. Tekrar çalıştırmak kopya oluşturmaz.
        </p>

        {!seasonReport || !seasonReport.exists ? (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            Henüz sezon verisi yok. “Güncel Sezonu Senkronize Et”e tıkla.
          </p>
        ) : (
          <>
            <p style={{ marginTop: 12 }}>
              <strong>{seasonReport.season?.name ?? "—"}</strong> ·{" "}
              {seasonReport.season?.isCurrent ? "güncel" : "güncel değil"} ·{" "}
              {formatDate(seasonReport.season?.startsAt ?? null)} →{" "}
              {formatDate(seasonReport.season?.endsAt ?? null)}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Kayıtlı hafta: <strong>{seasonReport.totalRounds}</strong> ·
              Kayıtlı maç: <strong>{seasonReport.totalFixtures}</strong>
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Sonraki hafta / kilit:{" "}
              {seasonReport.nextRound ? (
                <strong>
                  {seasonReport.nextRound.name
                    ? `Hafta ${seasonReport.nextRound.name}`
                    : `#${seasonReport.nextRound.sportmonksRoundId}`}{" "}
                  — {formatDateTime(seasonReport.nextRound.lockTime)}
                </strong>
              ) : (
                <em style={{ color: "var(--muted)" }}>
                  yaklaşan hafta yok (sezon bitti)
                </em>
              )}
            </p>

            {seasonReport.rounds.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                    <th style={{ padding: "4px 8px" }}>Hafta</th>
                    <th style={{ padding: "4px 8px" }}>Durum</th>
                    <th style={{ padding: "4px 8px", textAlign: "right" }}>
                      Maç
                    </th>
                    <th style={{ padding: "4px 8px" }}>Kilit zamanı (en erken)</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonReport.rounds.map((round) => (
                    <tr
                      key={round.sportmonksRoundId}
                      style={{ borderTop: "1px solid var(--border, #333)" }}
                    >
                      <td style={{ padding: "4px 8px" }}>
                        {round.name ?? `#${round.sportmonksRoundId}`}
                      </td>
                      <td style={{ padding: "4px 8px" }}>{round.status}</td>
                      <td style={{ padding: "4px 8px", textAlign: "right" }}>
                        {round.fixtureCount}
                      </td>
                      <td style={{ padding: "4px 8px" }}>
                        {formatDateTime(round.lockTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <div className="card">
        <span className="tag">Oyuncu Puanlama</span>
        <p>
          Senkronize edilen ham veriden{" "}
          <strong>{TEST_FIXTURE_ID}</strong> maçı için oyuncu maç puanlarını
          hesapla.
        </p>
        <form action={calculatePlayerScoresAction}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={!db.configured}
          >
            Oyuncu Puanlarını Hesapla
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Olayları, dizilişleri ve diziliş detaylarını okur, ardından{" "}
          <code>player_match_scores</code> tablosuna yazar. Sportmonks çağrısı
          yapılmaz. Tekrar çalıştırmak kopya oluşturmaz.
        </p>
      </div>

      <div className="card">
        <span className="tag">Test Menajer Puanı</span>
        <p>
          Gerçek maç oyuncularından simüle bir test menajeri (kullanıcı, lig,
          takım, kadro, diziliş) oluştur ve haftasını{" "}
          <code>player_match_scores</code> tablosundan puanla.
        </p>
        <form action={createTestManagerScoreAction}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={!db.configured}
          >
            Test Menajer Puanı Oluştur
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Boş diziliş slotları {EMPTY_SLOT_POINTS} puan alır; dizilişte olmayan
          kadro oyuncuları (yedekler) 0 puan alır. Sportmonks çağrısı yapılmaz.
          Tekrar çalıştırmak kopya hafta puanı veya diziliş slotu oluşturmaz.
        </p>
      </div>

      <div className="card">
        <span className="tag">Dengeli Başlangıç</span>
        <p>
          {DENGELI_SQUAD_SIZE} kişilik dengeli başlangıç kadrolarını oluştur
          (her menajere 2 Kaleci, 5 Defans, 5 Orta Saha, 3 Forvet). Eksikse
          oyunculara başlangıç piyasa değeri atanır.
        </p>
        <form action={generateDengeliSquadsAction}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={!db.configured}
          >
            Dengeli Kadroları Oluştur
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Kadro değerleri snake draft ile dengelenir; kimse haksız yıldız
          avantajı almaz. Sportmonks çağrısı yapılmaz. Tekrar çalıştırmak kadro
          oyuncularını çoğaltmaz.
        </p>

        {dengeliRows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            Henüz dengeli kadro oluşturulmadı. “Dengeli kadroları oluştur”a
            tıkla.
          </p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                marginTop: 12,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "4px 8px" }}>Takım</th>
                  <th style={{ padding: "4px 8px" }}>Oyuncu</th>
                  <th style={{ padding: "4px 8px" }}>Mevkiler</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>
                    Kadro değeri
                  </th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>
                    Kalan bütçe
                  </th>
                </tr>
              </thead>
              <tbody>
                {dengeliRows.map((row) => (
                  <tr
                    key={row.teamId}
                    style={{ borderTop: "1px solid var(--border, #333)" }}
                  >
                    <td style={{ padding: "4px 8px" }}>{row.teamName}</td>
                    <td style={{ padding: "4px 8px" }}>{row.squadCount}</td>
                    <td style={{ padding: "4px 8px" }}>
                      {DENGELI_SQUAD_COMPOSITION.map(
                        (slot) => `${slot.code} ${row.positionCounts[slot.code]}`,
                      ).join(" · ")}
                    </td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>
                      {formatTL(row.squadValue)}
                    </td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>
                      {formatTL(row.remainingBudget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
              Kadro değeri farkı (en yüksek − en düşük):{" "}
              <strong>{formatTL(dengeliSpread)}</strong>.
            </p>
          </>
        )}
      </div>

      <div className="card">
        <span className="tag">Son Menajer Puanı</span>
        {!latestManagerScore ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Henüz menajer puanı yok. “Test Menajer Puanı Oluştur”a tıkla.
          </p>
        ) : (
          <>
            <p>
              <strong>{latestManagerScore.managerTeam.name}</strong> — hafta
              toplamı <strong>{latestManagerScore.pointsTotal}</strong> puan (
              diziliş {latestManagerScore.pointsLineup}, boş slot{" "}
              {latestManagerScore.pointsEmptySlots}).
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                marginTop: 8,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "4px 8px" }}>#</th>
                  <th style={{ padding: "4px 8px" }}>Mevki</th>
                  <th style={{ padding: "4px 8px" }}>Oyuncu</th>
                  <th style={{ padding: "4px 8px" }}>Puan</th>
                </tr>
              </thead>
              <tbody>
                {(latestLineup?.slots ?? []).map((slot) => {
                  const points = slot.isEmpty
                    ? EMPTY_SLOT_POINTS
                    : matchPointsByPlayerId.get(slot.playerId ?? -1) ?? 0;
                  return (
                    <tr
                      key={slot.id}
                      style={{ borderTop: "1px solid var(--border, #333)" }}
                    >
                      <td style={{ padding: "4px 8px" }}>{slot.slotIndex}</td>
                      <td style={{ padding: "4px 8px" }}>{slot.slotPosition}</td>
                      <td style={{ padding: "4px 8px" }}>
                        {slot.isEmpty ? (
                          <em style={{ color: "var(--muted)" }}>boş slot</em>
                        ) : (
                          slot.player?.name ?? `Oyuncu ${slot.playerId}`
                        )}
                      </td>
                      <td style={{ padding: "4px 8px" }}>{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bankPlayers.length > 0 && (
              <>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  Yedek (kadroda, dizilişte değil) — 0 sayılır:
                </p>
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
                >
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                      <th style={{ padding: "4px 8px" }}>Oyuncu</th>
                      <th style={{ padding: "4px 8px" }}>Maç puanı</th>
                      <th style={{ padding: "4px 8px" }}>Sayılan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankPlayers.map((sp) => (
                      <tr
                        key={sp.id}
                        style={{ borderTop: "1px solid var(--border, #333)" }}
                      >
                        <td style={{ padding: "4px 8px" }}>
                          {sp.player?.name ?? `Oyuncu ${sp.playerId}`}
                        </td>
                        <td style={{ padding: "4px 8px" }}>
                          {matchPointsByPlayerId.get(sp.playerId) ?? 0}
                        </td>
                        <td style={{ padding: "4px 8px" }}>0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>

      <div className="card">
        <span className="tag">Son Maç Senkronizasyonları</span>
        {recentLogs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Henüz senkronizasyon kaydı yok.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "4px 8px" }}>#</th>
                <th style={{ padding: "4px 8px" }}>Durum</th>
                <th style={{ padding: "4px 8px" }}>Çekilen</th>
                <th style={{ padding: "4px 8px" }}>Oluşturulan</th>
                <th style={{ padding: "4px 8px" }}>Güncellenen</th>
                <th style={{ padding: "4px 8px" }}>Bitiş</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} style={{ borderTop: "1px solid var(--border, #333)" }}>
                  <td style={{ padding: "4px 8px" }}>{log.id}</td>
                  <td style={{ padding: "4px 8px" }}>{log.status}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsFetched}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsCreated}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsUpdated}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {log.finishedAt
                      ? log.finishedAt.toISOString().replace("T", " ").slice(0, 19)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <span className="tag">Son Puanlama İşlemleri</span>
        {recentScoringRuns.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Henüz puanlama işlemi kaydı yok.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "4px 8px" }}>#</th>
                <th style={{ padding: "4px 8px" }}>Durum</th>
                <th style={{ padding: "4px 8px" }}>Oyuncu</th>
                <th style={{ padding: "4px 8px" }}>Bitiş</th>
                <th style={{ padding: "4px 8px" }}>Hata</th>
              </tr>
            </thead>
            <tbody>
              {recentScoringRuns.map((scoringRun) => (
                <tr
                  key={scoringRun.id}
                  style={{ borderTop: "1px solid var(--border, #333)" }}
                >
                  <td style={{ padding: "4px 8px" }}>{scoringRun.id}</td>
                  <td style={{ padding: "4px 8px" }}>{scoringRun.status}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {scoringRun.playersScored}
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    {scoringRun.finishedAt
                      ? scoringRun.finishedAt
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 19)
                      : "—"}
                  </td>
                  <td style={{ padding: "4px 8px", color: "var(--muted)" }}>
                    {scoringRun.errorMessage ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
