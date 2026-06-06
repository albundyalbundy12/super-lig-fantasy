"use client";

import { useMemo, useState } from "react";

import {
  ALL_FORMATIONS,
  DEFAULT_FORMATION,
  FREE_FORMATIONS,
  PRO_FORMATIONS,
  type Formation,
  type PositionCat,
} from "./formations";

export type PitchPlayer = {
  playerId: number;
  name: string;
  cat: PositionCat;
  points: number;
};

export type BenchPlayer = {
  playerId: number;
  name: string;
  cat: PositionCat;
};

type PlacedSlot =
  | { kind: "player"; player: PitchPlayer }
  | { kind: "empty"; cat: PositionCat };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ptsClass(points: number): string {
  if (points > 0) return "pos";
  if (points < 0) return "neg";
  return "zero";
}

export function Pitch({
  startingXI,
  squad,
}: {
  startingXI: PitchPlayer[];
  squad: BenchPlayer[];
}) {
  const [formationKey, setFormationKey] = useState(DEFAULT_FORMATION);
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const formation =
    ALL_FORMATIONS.find((f) => f.key === formationKey) ?? FREE_FORMATIONS[0];

  const { rows, placedIds } = useMemo(
    () => placePlayers(formation, startingXI),
    [formation, startingXI],
  );

  const bench = useMemo(
    () => squad.filter((p) => !placedIds.has(p.playerId)),
    [squad, placedIds],
  );

  return (
    <>
      <div className="card">
        <div className="formation-bar">
          <span className="formation-bar-label">
            Formasyon seç — taktiksel tercih, puanı etkilemez.
          </span>
          <div className="formation-pills">
            {FREE_FORMATIONS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`f-pill${f.key === formationKey ? " active" : ""}`}
                onClick={() => setFormationKey(f.key)}
              >
                {f.key}
              </button>
            ))}
            {PRO_FORMATIONS.map((f) => (
              <button
                key={f.key}
                type="button"
                className="f-pill locked"
                onClick={() => setSheetFor(f.key)}
                aria-label={`${f.key} — Pro ile açılır`}
              >
                <span className="lock-ico" aria-hidden>
                  🔒
                </span>
                {f.key} · Pro ile Açılır
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="pitch" role="img" aria-label={`Diziliş ${formation.key}`}>
          <span className="pitch-goalbox top" aria-hidden />
          <span className="pitch-goalbox bottom" aria-hidden />
          {rows.map((row, rowIndex) => (
            <div className="pitch-row" key={rowIndex}>
              {row.map((slot, slotIndex) =>
                slot.kind === "player" ? (
                  <div className="player-chip" key={`p-${slot.player.playerId}`}>
                    <div
                      className={`chip-shirt${slot.player.cat === "GK" ? " gk" : ""}`}
                    >
                      {initials(slot.player.name)}
                      <span className={`chip-pts ${ptsClass(slot.player.points)}`}>
                        {slot.player.points > 0
                          ? `+${slot.player.points}`
                          : slot.player.points}
                      </span>
                    </div>
                    <span className="chip-name">{slot.player.name}</span>
                  </div>
                ) : (
                  <div
                    className="player-chip slot-empty"
                    key={`e-${rowIndex}-${slotIndex}`}
                  >
                    <div className="chip-shirt" aria-hidden>
                      +
                    </div>
                    <span className="chip-name">Boş Slot</span>
                    <span className="slot-risk">-4 Puan Riski</span>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="legend">
          <span>
            <i style={{ background: "#1f9d5a" }} /> Pozitif puan
          </span>
          <span>
            <i style={{ background: "#d23b3b" }} /> Negatif puan
          </span>
          <span>
            <i
              style={{
                background: "transparent",
                border: "1px dashed rgba(120,140,160,0.8)",
              }}
            />{" "}
            Boş slot (-4)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="bench-head">
          <span className="bench-title">Yedekler</span>
          <span className="bench-meta">Yedek oyuncular 0 puan üretir</span>
        </div>
        {bench.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Bu dizilişte yedek oyuncu yok.
          </p>
        ) : (
          <div className="bench-list">
            {bench.map((p) => (
              <div className="bench-item" key={p.playerId}>
                <span className={`bench-dot${p.cat === "GK" ? " gk" : ""}`}>
                  {initials(p.name)}
                </span>
                <span>
                  <span className="bench-name">{p.name}</span>
                  <br />
                  <span className="bench-meta">{catLabel(p.cat)} · 0 puan</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {sheetFor && (
        <div
          className="sheet-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSheetFor(null)}
        >
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" aria-hidden />
            <span className="sheet-badge">
              <span aria-hidden>🔒</span> Pro Formasyon
            </span>
            <h3>{sheetFor} dizilişi Pro ile açılır</h3>
            <p>
              Daha fazla taktiksel esneklik için Pro formasyonlarını aç. Tüm
              klasik dizilişler ücretsiz kalır.
            </p>
            <div className="sheet-note">
              Formasyon seçimi puan üretmez. Taktiksel tercih tamamen senin.
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn btn-gold">
                Pro&apos;ya Geç
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSheetFor(null)}
              >
                Şimdi Değil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function catLabel(cat: PositionCat): string {
  switch (cat) {
    case "GK":
      return "Kaleci";
    case "DEF":
      return "Defans";
    case "MID":
      return "Orta Saha";
    case "FWD":
      return "Forvet";
  }
}

/**
 * Distributes the starting XI players into the selected formation's rows by
 * position pool. Rows that need more players than the pool has render empty
 * slots. Returns the placed player ids so the caller can compute the bench.
 */
function placePlayers(
  formation: Formation,
  startingXI: PitchPlayer[],
): { rows: PlacedSlot[][]; placedIds: Set<number> } {
  const pools: Record<PositionCat, PitchPlayer[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };
  for (const p of startingXI) pools[p.cat].push(p);

  const cursor: Record<PositionCat, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const placedIds = new Set<number>();

  const rows: PlacedSlot[][] = formation.rows.map((row) => {
    const slots: PlacedSlot[] = [];
    for (let i = 0; i < row.count; i++) {
      const next = pools[row.cat][cursor[row.cat]];
      if (next) {
        cursor[row.cat] += 1;
        placedIds.add(next.playerId);
        slots.push({ kind: "player", player: next });
      } else {
        slots.push({ kind: "empty", cat: row.cat });
      }
    }
    return slots;
  });

  return { rows, placedIds };
}
