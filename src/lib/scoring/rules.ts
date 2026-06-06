/**
 * Player scoring rules (Task 5), version 0.1.
 *
 * Pure, side-effect-free functions that turn raw match facts into fantasy
 * points. They encode docs/SCORING_RULES.md exactly — no invented rules. Only
 * the categories required by Task 5 are implemented here: rating, minutes,
 * goals (by position), assists and cards. Clean sheet / own goals / missed
 * penalties exist in the schema but are intentionally deferred to a later task.
 */

/** Sportmonks position ids (docs/SCORING_RULES.md §5). */
export const POSITION = {
  GOALKEEPER: 24,
  DEFENDER: 25,
  MIDFIELDER: 26,
  FORWARD: 27,
} as const;

/** Sportmonks event type ids relevant to scoring (docs/SCORING_RULES.md). */
export const EVENT_TYPE = {
  GOAL: 14,
  PENALTY_GOAL: 16,
  YELLOW_CARD: 19,
  RED_CARD: 20,
} as const;

/** Sportmonks lineup-detail type ids (provisional, docs/SCORING_RULES.md §11/§12). */
export const DETAIL_TYPE = {
  RATING: 118,
  MINUTES: 119,
} as const;

/** Fixed point values (docs/SCORING_RULES.md §8/§9). */
export const ASSIST_POINTS = 2;
export const YELLOW_CARD_POINTS = -1;
export const RED_CARD_POINTS = -4;

/** Empty lineup slot penalty (MVP_BUILD_PLAN.md §3 rule 8). */
export const EMPTY_SLOT_POINTS = -4;

/** Goal points by Sportmonks position id (docs/SCORING_RULES.md §6). */
export function goalPointsForPosition(positionId: number | null): number {
  switch (positionId) {
    case POSITION.GOALKEEPER:
      return 6;
    case POSITION.DEFENDER:
      return 5;
    case POSITION.MIDFIELDER:
      return 4;
    case POSITION.FORWARD:
      return 3;
    default:
      // Unknown position: the docs only define 24-27. Award no goal points
      // rather than guess, but the goal count is still recorded.
      return 0;
  }
}

/** Minutes bonus (docs/SCORING_RULES.md §11): 60+ minutes = +1, else 0. */
export function minutesPoints(minutes: number): number {
  return minutes >= 60 ? 1 : 0;
}

/** Rating points (docs/SCORING_RULES.md §12). Missing rating = 0. */
export function ratingPoints(rating: number | null): number {
  if (rating === null) return 0;
  if (rating < 5.5) return -2;
  if (rating < 6.0) return -1;
  if (rating < 7.0) return 0;
  if (rating < 7.5) return 1;
  if (rating < 8.0) return 2;
  if (rating < 8.5) return 3;
  return 4;
}

/** Card points (docs/SCORING_RULES.md §9). */
export function cardPoints(yellowCards: number, redCards: number): number {
  return yellowCards * YELLOW_CARD_POINTS + redCards * RED_CARD_POINTS;
}
