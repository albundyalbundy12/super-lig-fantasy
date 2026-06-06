"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────
export type SlotData = {
  id: number;
  slotIndex: number;
  slotPosition: string;
  playerName: string | null;
  playerId: number | null;
  isEmpty: boolean;
  points: number;
};

export type BenchPlayer = {
  id: number;
  playerId: number;
  playerName: string | null;
  positionLabel: string;
};

export type LineupClientProps = {
  slots: SlotData[];
  bench: BenchPlayer[];
  formation: string;
  totalPoints: number;
  teamName: string;
};

// ─── Formation row definitions ────────────────────────────
// y = % from top (so GK is high y near bottom, FWD is low y near top)
type Row = { pos: string; count: number; y: number };

const ROWS: Record<string, Row[]> = {
  "4-4-2": [
    { pos: "FWD", count: 2, y: 13 },
    { pos: "MID", count: 4, y: 37 },
    { pos: "DEF", count: 4, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "4-3-3": [
    { pos: "FWD", count: 3, y: 13 },
    { pos: "MID", count: 3, y: 37 },
    { pos: "DEF", count: 4, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "3-5-2": [
    { pos: "FWD", count: 2, y: 13 },
    { pos: "MID", count: 5, y: 37 },
    { pos: "DEF", count: 3, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "3-4-3": [
    { pos: "FWD", count: 3, y: 13 },
    { pos: "MID", count: 4, y: 37 },
    { pos: "DEF", count: 3, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "4-2-3-1": [
    { pos: "FWD", count: 1, y: 10 },
    { pos: "MID", count: 3, y: 28 },
    { pos: "MID", count: 2, y: 46 },
    { pos: "DEF", count: 4, y: 63 },
    { pos: "GK",  count: 1, y: 82 },
  ],
  "4-5-1": [
    { pos: "FWD", count: 1, y: 11 },
    { pos: "MID", count: 5, y: 37 },
    { pos: "DEF", count: 4, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "5-3-2": [
    { pos: "FWD", count: 2, y: 13 },
    { pos: "MID", count: 3, y: 38 },
    { pos: "DEF", count: 5, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "5-4-1": [
    { pos: "FWD", count: 1, y: 11 },
    { pos: "MID", count: 4, y: 37 },
    { pos: "DEF", count: 5, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "3-4-2-1": [
    { pos: "FWD", count: 1, y: 10 },
    { pos: "MID", count: 2, y: 27 },
    { pos: "MID", count: 4, y: 46 },
    { pos: "DEF", count: 3, y: 63 },
    { pos: "GK",  count: 1, y: 82 },
  ],
  "4-1-4-1": [
    { pos: "FWD", count: 1, y: 10 },
    { pos: "MID", count: 4, y: 30 },
    { pos: "MID", count: 1, y: 49 },
    { pos: "DEF", count: 4, y: 63 },
    { pos: "GK",  count: 1, y: 82 },
  ],
};

const FREE_FORMATIONS = ["4-4-2", "4-3-3", "3-5-2"];
const PRO_FORMATIONS  = ["3-4-3","4-2-3-1","4-5-1","5-3-2","5-4-1","3-4-2-1","4-1-4-1"];

// ─── Helpers ──────────────────────────────────────────────
function xPositions(n: number): number[] {
  if (n === 1) return [50];
  const gap = 80 / (n + 1);
  return Array.from({ length: n }, (_, i) => 10 + gap * (i + 1));
}

function initials(name: string | null): string {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1
    ? p[0].slice(0, 2).toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function lastName(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(" ");
  return p[p.length - 1];
}

function posInfo(pos: string): { short: string; key: string } {
  switch (pos) {
    case "GK":  return { short: "KL",  key: "gk"  };
    case "DEF": return { short: "DEF", key: "def" };
    case "MID": return { short: "OS",  key: "mid" };
    case "FWD": return { short: "FOR", key: "fwd" };
    default:    return { short: pos,   key: "mid" };
  }
}

// ─── Build visual positions from slot data ─────────────────
type VisualSlot = { x: number; y: number; slot: SlotData | null };

function buildVisual(slots: SlotData[], formation: string): VisualSlot[] {
  const rows = ROWS[formation] ?? ROWS["4-4-2"];
  const byPos: Record<string, SlotData[]> = { GK: [], DEF: [], MID: [], FWD: [] };

  for (const s of slots) {
    const p = s.slotPosition in byPos ? s.slotPosition : "MID";
    byPos[p].push(s);
  }

  const consumed: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const result: VisualSlot[] = [];

  for (const row of rows) {
    const xs = xPositions(row.count);
    for (let i = 0; i < row.count; i++) {
      const pool = byPos[row.pos] ?? [];
      const slot = pool[consumed[row.pos] ?? 0] ?? null;
      if (slot) consumed[row.pos] = (consumed[row.pos] ?? 0) + 1;
      result.push({ x: xs[i], y: row.y, slot });
    }
  }

  return result;
}

// ─── Component ────────────────────────────────────────────
export function LineupClient({
  slots,
  bench,
  formation,
  totalPoints,
  teamName,
}: LineupClientProps) {
  const [activeFree, setActiveFree] = useState(formation);
  const [proModal, setProModal]     = useState<string | null>(null);

  // Always render actual DB data — formation switch is cosmetic
  const visual = buildVisual(slots, formation);
  const hasEmpty = slots.some((s) => s.isEmpty || s.playerId === null);

  function handlePill(f: string) {
    if (PRO_FORMATIONS.includes(f)) { setProModal(f); return; }
    setActiveFree(f);
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-title">Diziliş</div>
        <div className="page-subtitle">
          {teamName} ·{" "}
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--gold)" }}>
            {formation}
          </span>
          {" · "}
          <span style={{ color: totalPoints >= 0 ? "var(--lime)" : "var(--red)", fontWeight: 700 }}>
            {totalPoints > 0 ? "+" : ""}{totalPoints} puan
          </span>
        </div>
      </div>

      {/* Formation selector */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div className="formation-bar">
            {/* Free formations */}
            <div className="formation-group">
              <div className="formation-group-label">Ücretsiz</div>
              <div className="pills">
                {FREE_FORMATIONS.map((f) => (
                  <button
                    key={f}
                    className={`pill${activeFree === f ? " active" : ""}`}
                    onClick={() => handlePill(f)}
                  >
                    <span className="pill-name">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro formations */}
            <div className="formation-group">
              <div className="formation-group-label pro">Pro</div>
              <div className="pills">
                {PRO_FORMATIONS.map((f) => (
                  <button
                    key={f}
                    className="pill locked"
                    onClick={() => handlePill(f)}
                  >
                    <span className="pill-name">{f}</span>
                    <span className="pill-sub">🔒 Pro ile Açılır</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="pitch-outer">
          <div className="pitch-wrap">
            {/* Field markings */}
            <div className="pitch-markings">
              <div className="pitch-center-line" />
              <div className="pitch-center-circle" />
              <div className="pitch-center-dot" />
              <div className="pitch-penalty-top" />
              <div className="pitch-penalty-bot" />
              <div className="pitch-goal-top" />
              <div className="pitch-goal-bot" />
            </div>

            {/* Players */}
            <div className="pitch-players">
              {visual.map((vs, idx) => {
                const s = vs.slot;
                const empty = !s || s.isEmpty || s.playerId === null;

                if (empty) {
                  return (
                    <div
                      key={s ? s.id : `ph-${idx}`}
                      className="chip empty"
                      style={{ left: `${vs.x}%`, top: `${vs.y}%` }}
                    >
                      <div className="chip-avatar">+</div>
                      <div className="chip-plate">
                        <span className="chip-name">Boş Slot</span>
                        <span className="chip-pts">-4 Puan Riski</span>
                      </div>
                    </div>
                  );
                }

                const pi = posInfo(s.slotPosition);
                const neg = s.points < 0;

                return (
                  <div
                    key={s.id}
                    className="chip"
                    style={{ left: `${vs.x}%`, top: `${vs.y}%` }}
                  >
                    <div className="chip-avatar">
                      {initials(s.playerName)}
                      <span className={`chip-pos ${pi.key}`}>{pi.short}</span>
                    </div>
                    <div className="chip-plate">
                      <span className="chip-name">{lastName(s.playerName)}</span>
                      <span className={`chip-pts${neg ? " neg" : ""}`}>
                        {s.points > 0 ? "+" : ""}{s.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench */}
          {bench.length > 0 && (
            <div className="bench">
              <div className="bench-label">
                Yedekler · 0 puan sayılmaz
              </div>
              <div className="bench-row">
                {bench.map((bp) => (
                  <div key={bp.id} className="bench-card">
                    <div className="avatar sm">{initials(bp.playerName)}</div>
                    <div>
                      <div className="bench-name">
                        {bp.playerName ?? `#${bp.playerId}`}
                      </div>
                      <div className="bench-sub">{bp.positionLabel} · 0 puan</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty slot warning */}
      {hasEmpty && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="alert alert-err">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.667 1.73-3L13.73 4c-.77-1.333-2.69-1.333-3.46 0L3.34 16c-.77 1.333.19 3 1.73 3z" />
            </svg>
            <span>
              Dizilişinde boş pozisyon var. Her boş pozisyon{" "}
              <strong>−4 puan</strong> cezası getirir.
            </span>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />

      {/* Pro formation modal */}
      {proModal && (
        <div
          className="modal-overlay"
          onClick={() => setProModal(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <div className="modal-eyebrow">Pro Formasyon</div>
            <div className="modal-formation">{proModal}</div>
            <p className="modal-body">
              Pro üyelikle 7 farklı formasyon seçeneğine ulaş ve dizilişini
              daha esnek kur. Taktiksel özgürlük — puan avantajı değil.
            </p>
            <ul className="modal-features">
              <li>7 ek formasyon seçeneği</li>
              <li>Dengeli başlangıç formasyonları</li>
              <li>Gelişmiş taktik esnekliği</li>
            </ul>
            <div className="modal-actions">
              <button className="btn-pro-cta">Pro&apos;ya Geç</button>
              <button
                className="btn-dismiss"
                onClick={() => setProModal(null)}
              >
                Şimdi Değil
              </button>
            </div>
            <p className="modal-reassurance">
              Formasyon seçimi puan üretmez. Taktiksel tercih tamamen senin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
