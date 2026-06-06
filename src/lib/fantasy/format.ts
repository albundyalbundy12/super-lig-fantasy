/**
 * Pure display helpers for the Turkish user-facing pages (Task 8).
 *
 * These only format already-loaded data for display. Internal identifiers,
 * route names and database fields stay in English — only the visible text is
 * Turkish.
 */

/** Format an integer amount as visible TL currency, e.g. "100.000.000 TL". */
export function formatTL(amount: number): string {
  return `${new Intl.NumberFormat("tr-TR").format(amount)} TL`;
}

/** Format a signed points value, e.g. "+9", "-4", "0". */
export function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : `${points}`;
}

/** Turkish label for a lineup slot position code (GK/DEF/MID/FWD). */
export function slotPositionLabel(code: string): string {
  switch (code) {
    case "GK":
      return "Kaleci";
    case "DEF":
      return "Defans";
    case "MID":
      return "Orta Saha";
    case "FWD":
      return "Forvet";
    default:
      return code;
  }
}

/** Turkish label for a Sportmonks position id (24-27). */
export function positionIdLabel(positionId: number | null): string {
  switch (positionId) {
    case 24:
      return "Kaleci";
    case 25:
      return "Defans";
    case 26:
      return "Orta Saha";
    case 27:
      return "Forvet";
    default:
      return "—";
  }
}
