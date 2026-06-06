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

/**
 * Deterministic test manager used by the simulated manager-scoring flow
 * (Task 6). Players are referenced by their stable Sportmonks player id so the
 * flow survives a database reseed. All ids belong to fixture 18903623's squads.
 *
 * The lineup is a 4-4-2 (11 slots). One DEF slot is intentionally left empty to
 * exercise the -4 empty-slot rule. The bench players are in the squad but NOT in
 * the lineup, so they must score 0 regardless of their real match points.
 */
export const TEST_MANAGER = {
  userEmail: "test-manager@superlig.local",
  userName: "Test Manager",
  leagueName: "Test League",
  leagueInviteCode: "TEST-LEAGUE-1",
  teamName: "Test FC",
  formation: DEFAULT_FORMATION,
  slots: [
    { slotIndex: 0, slotPosition: "GK", sportmonksPlayerId: 128229 }, // Muslera
    { slotIndex: 1, slotPosition: "DEF", sportmonksPlayerId: 63164 }, // Colley
    { slotIndex: 2, slotPosition: "DEF", sportmonksPlayerId: 201370 }, // Bardakcı
    { slotIndex: 3, slotPosition: "DEF", sportmonksPlayerId: 12036864 }, // Boey
    { slotIndex: 4, slotPosition: "DEF", sportmonksPlayerId: null }, // empty (-4)
    { slotIndex: 5, slotPosition: "MID", sportmonksPlayerId: 130022 }, // Torreira
    { slotIndex: 6, slotPosition: "MID", sportmonksPlayerId: 534383 }, // Kerem Aktürkoğlu
    { slotIndex: 7, slotPosition: "MID", sportmonksPlayerId: 29313293 }, // Tetê
    { slotIndex: 8, slotPosition: "MID", sportmonksPlayerId: 31878 }, // Kaan Ayhan
    { slotIndex: 9, slotPosition: "FWD", sportmonksPlayerId: 129095 }, // Icardi
    { slotIndex: 10, slotPosition: "FWD", sportmonksPlayerId: 4243131 }, // Barış Alper Yılmaz
  ],
  // Squad-only players (bench): in the squad but never in the lineup => 0 points.
  benchSportmonksPlayerIds: [98079, 850], // Rosier (4 pts), Oxlade-Chamberlain (5 pts)
} as const;
