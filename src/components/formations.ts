/**
 * Formation definitions for the visual Diziliş (lineup) pitch.
 *
 * Formation choice is a purely tactical/visual preference — it does NOT change
 * scoring (see docs/SCORING_RULES.md). Rows are ordered top→bottom as shown on
 * the pitch (attack first, goalkeeper last). Each row draws players from its
 * position pool; when the pool runs out the remaining slots render as empty.
 */

export type PositionCat = "GK" | "DEF" | "MID" | "FWD";

export type FormationRow = { cat: PositionCat; count: number };

export type Formation = {
  key: string;
  /** Rows top (forwards) → bottom (goalkeeper). */
  rows: FormationRow[];
  pro: boolean;
};

const GK: FormationRow = { cat: "GK", count: 1 };

/** Free formations available to every manager. */
export const FREE_FORMATIONS: Formation[] = [
  {
    key: "4-4-2",
    pro: false,
    rows: [{ cat: "FWD", count: 2 }, { cat: "MID", count: 4 }, { cat: "DEF", count: 4 }, GK],
  },
  {
    key: "4-3-3",
    pro: false,
    rows: [{ cat: "FWD", count: 3 }, { cat: "MID", count: 3 }, { cat: "DEF", count: 4 }, GK],
  },
  {
    key: "3-5-2",
    pro: false,
    rows: [{ cat: "FWD", count: 2 }, { cat: "MID", count: 5 }, { cat: "DEF", count: 3 }, GK],
  },
];

/** Pro formations — visible but locked behind the upgrade for free managers. */
export const PRO_FORMATIONS: Formation[] = [
  {
    key: "3-4-3",
    pro: true,
    rows: [{ cat: "FWD", count: 3 }, { cat: "MID", count: 4 }, { cat: "DEF", count: 3 }, GK],
  },
  {
    key: "4-2-3-1",
    pro: true,
    rows: [
      { cat: "FWD", count: 1 },
      { cat: "MID", count: 3 },
      { cat: "MID", count: 2 },
      { cat: "DEF", count: 4 },
      GK,
    ],
  },
  {
    key: "4-5-1",
    pro: true,
    rows: [{ cat: "FWD", count: 1 }, { cat: "MID", count: 5 }, { cat: "DEF", count: 4 }, GK],
  },
  {
    key: "5-3-2",
    pro: true,
    rows: [{ cat: "FWD", count: 2 }, { cat: "MID", count: 3 }, { cat: "DEF", count: 5 }, GK],
  },
  {
    key: "5-4-1",
    pro: true,
    rows: [{ cat: "FWD", count: 1 }, { cat: "MID", count: 4 }, { cat: "DEF", count: 5 }, GK],
  },
  {
    key: "3-4-2-1",
    pro: true,
    rows: [
      { cat: "FWD", count: 1 },
      { cat: "MID", count: 2 },
      { cat: "MID", count: 4 },
      { cat: "DEF", count: 3 },
      GK,
    ],
  },
  {
    key: "4-1-4-1",
    pro: true,
    rows: [
      { cat: "FWD", count: 1 },
      { cat: "MID", count: 4 },
      { cat: "MID", count: 1 },
      { cat: "DEF", count: 4 },
      GK,
    ],
  },
];

export const ALL_FORMATIONS: Formation[] = [
  ...FREE_FORMATIONS,
  ...PRO_FORMATIONS,
];

export const DEFAULT_FORMATION = "4-4-2";
