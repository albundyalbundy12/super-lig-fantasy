"use client";

import { useState } from "react";

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

// ─── Formation definitions ───────────────────────────────────────────────────
// Each row has: which slot position it contains, how many, and y% from top.
// GK is near the bottom (high y%), FWD is near the top (low y%).

type FormationRow = {
  pos: string; // 'GK' | 'DEF' | 'MID' | 'FWD'
  count: number;
  y: number; // 0-100 (% from top of pitch)
};

const FORMATION_ROWS: Record<string, FormationRow[]> = {
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
    { pos: "MID", count: 3, y: 27 },
    { pos: "MID", count: 2, y: 46 },
    { pos: "DEF", count: 4, y: 63 },
    { pos: "GK",  count: 1, y: 81 },
  ],
  "4-5-1": [
    { pos: "FWD", count: 1, y: 12 },
    { pos: "MID", count: 5, y: 38 },
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
    { pos: "FWD", count: 1, y: 12 },
    { pos: "MID", count: 4, y: 38 },
    { pos: "DEF", count: 5, y: 62 },
    { pos: "GK",  count: 1, y: 83 },
  ],
  "3-4-2-1": [
    { pos: "FWD", count: 1, y: 10 },
    { pos: "MID", count: 2, y: 27 },
    { pos: "MID", count: 4, y: 46 },
    { pos: "DEF", count: 3, y: 63 },
    { pos: "GK",  count: 1, y: 81 },
  ],
  "4-1-4-1": [
    { pos: "FWD", count: 1, y: 10 },
    { pos: "MID", count: 4, y: 30 },
    { pos: "MID", count: 1, y: 49 },
    { pos: "DEF", count: 4, y: 63 },
    { pos: "GK",  count: 1, y: 81 },
  ],
};

const FREE_FORMATIONS = ["4-4-2", "4-3-3", "3-5-2"];
const PRO_FORMATIONS = [
  "3-4-3", "4-2-3-1", "4-5-1",
  "5-3-2", "5-4-1", "3-4-2-1", "4-1-4-1",
];

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Evenly distribute N items across x-axis (returns % values)
function xPositions(count: number): number[] {
  if (count === 1) return [50];
  const gap = 80 / (count + 1);
  return Array.from({ length: count }, (_, i) => 10 + gap * (i + 1));
}

// ─── Pitch rendering ─────────────────────────────────────────────────────────

type RenderedSlot = {
  x: number;
  y: number;
  slot: SlotData | null; // null = empty display slot (for formation preview)
};

function buildPitchSlots(
  slots: SlotData[],
  formation: string,
): RenderedSlot[] {
  const rows = FORMATION_ROWS[formation] ?? FORMATION_ROWS["4-4-2"];
  const result: RenderedSlot[] = [];

  // Group actual slot data by position
  const byPos: Record<string, SlotData[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const s of slots) {
    const pos = s.slotPosition in byPos ? s.slotPosition : "MID";
    byPos[pos].push(s);
  }

  // Track how many we've consumed from each position group
  const consumed: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  for (const row of rows) {
    const xs = xPositions(row.count);
    for (let i = 0; i < row.count; i++) {
      const posSlots = byPos[row.pos] ?? [];
      const slot = posSlots[consumed[row.pos] ?? 0] ?? null;
      if (slot) consumed[row.pos] = (consumed[row.pos] ?? 0) + 1;

      result.push({ x: xs[i], y: row.y, slot });
    }
  }

  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LineupClient({
  slots,
  bench,
  formation,
  totalPoints,
  teamName,
}: LineupClientProps) {
  const [selectedFormation, setSelectedFormation] = useState(formation);
  const [proModal, setProModal] = useState<string | null>(null); // formation name

  const pitchSlots = buildPitchSlots(slots, formation); // always use DB formation for actual data

  function handleFormationClick(f: string) {
    if (PRO_FORMATIONS.includes(f)) {
      setProModal(f);
      return;
    }
    setSelectedFormation(f);
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Diziliş</h1>
        <p className="page-subtitle">
          {teamName} · {formation} ·{" "}
          <span className="text-gold" style={{ fontWeight: 700 }}>
            {totalPoints} puan
          </span>
        </p>
      </div>

      {/* Formation selector */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Formasyon</div>
        </div>

        <div className="formation-section" style={{ marginTop: 12 }}>
          <div className="formation-group-label">Ücretsiz</div>
          <div className="formation-pills">
            {FREE_FORMATIONS.map((f) => (
              <button
                key={f}
                className={`formation-pill${selectedFormation === f ? " active" : ""}`}
                onClick={() => handleFormationClick(f)}
              >
                <span className="formation-pill-name">{f}</span>
              </button>
            ))}
          </div>

          <div className="formation-group-label pro-label">Pro</div>
          <div className="formation-pills">
            {PRO_FORMATIONS.map((f) => (
              <button
                key={f}
                className="formation-pill pro"
                onClick={() => handleFormationClick(f)}
              >
                <span className="formation-pill-name">{f}</span>
                <span className="formation-pill-sub">🔒 Pro ile Açılır</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Football pitch */}
      <div className="card" style={{ padding: "16px 12px" }}>
        <div className="pitch-wrap">
          {/* Field markings */}
          <div className="pitch-markings">
            <div className="pitch-center-line" />
            <div className="pitch-center-circle" />
            <div className="pitch-penalty-top" />
            <div className="pitch-penalty-bot" />
            <div className="pitch-goal-top" />
            <div className="pitch-goal-bot" />
          </div>

          {/* Players */}
          <div className="pitch-players">
            {pitchSlots.map((ps, idx) => {
              if (!ps.slot) {
                // Phantom empty slot (formation has more positions than slots in DB)
                return (
                  <div
                    key={`phantom-${idx}`}
                    className="player-chip empty"
                    style={{ left: `${ps.x}%`, top: `${ps.y}%` }}
                  >
                    <div className="player-chip-avatar">+</div>
                    <div className="player-chip-name">Boş</div>
                    <div className="player-chip-pts">-4</div>
                  </div>
                );
              }

              const slot = ps.slot;
              const empty = slot.isEmpty || slot.playerId === null;
              const name = slot.playerName ?? "—";
              const displayName = name.split(" ").pop() ?? name; // last name only

              return (
                <div
                  key={slot.id}
                  className={`player-chip${empty ? " empty" : ""}`}
                  style={{ left: `${ps.x}%`, top: `${ps.y}%` }}
                >
                  <div className="player-chip-avatar">
                    {empty ? "+" : initials(name)}
                  </div>
                  <div className="player-chip-name">
                    {empty ? "Boş Slot" : displayName}
                  </div>
                  <div className="player-chip-pts">
                    {empty ? "-4 Puan" : `${slot.points > 0 ? "+" : ""}${slot.points}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bench */}
      {bench.length > 0 && (
        <div className="bench-section" style={{ marginBottom: 14 }}>
          <div className="bench-label">Yedekler — 0 puan sayılmaz</div>
          <div className="bench-row">
            {bench.map((bp) => (
              <div key={bp.id} className="bench-card">
                <div className="bench-avatar">{initials(bp.playerName)}</div>
                <div className="bench-info">
                  <div className="bench-name">
                    {bp.playerName ?? `Oyuncu #${bp.playerId}`}
                  </div>
                  <div className="bench-sub">{bp.positionLabel} · 0 puan</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty slot warning */}
      {slots.some((s) => s.isEmpty || s.playerId === null) && (
        <div className="alert alert-err">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            Dizilişinde boş pozisyon var. Her boş pozisyon{" "}
            <strong>−4 puan</strong> cezası getirir.
          </span>
        </div>
      )}

      {/* Pro formation modal */}
      {proModal && (
        <div className="modal-backdrop" onClick={() => setProModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag" />
            <div className="modal-badge">
              <span>⬡</span>
              <span>Pro Formasyon</span>
            </div>
            <div className="modal-formation">{proModal}</div>
            <p className="modal-body">
              Pro üyelikle 7 farklı formasyon seçeneğine ulaş. Taktiksel
              özgürlük tamamen sende.
            </p>
            <ul className="modal-features">
              <li>7 ek formasyon seçeneği</li>
              <li>Gelişmiş diziliş esnekliği</li>
              <li>Taktiksel tercih — daha fazla puan değil</li>
            </ul>
            <div className="modal-actions">
              <button className="btn-pro">Pro&apos;ya Geç →</button>
              <button className="btn-dismiss" onClick={() => setProModal(null)}>
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
