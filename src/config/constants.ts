/**
 * Known, non-secret identifiers documented in docs/.
 * These are public Sportmonks IDs — never put the API token here.
 */

export const SUPER_LIG_LEAGUE_ID = 600;
export const CURRENT_SEASON_ID = 25682;

/**
 * Historical test fixture used to validate the data + scoring chain.
 * Galatasaray vs Beşiktaş, Season 22057. See docs/API_TEST_RESULTS.md.
 */
export const TEST_FIXTURE_ID = 18903623;

export const IN_GAME_CURRENCY = "TL" as const;
export const DEFAULT_START_BUDGET = 100_000_000; // 100 Mio. TL
export const DEFAULT_FORMATION = "4-4-2" as const;
