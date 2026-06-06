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
 * Sportmonks position ids used across the project (docs/TYPE_ID_MAPPING.md).
 */
export const POSITION_ID = {
  GK: 24,
  DEF: 25,
  MID: 26,
  FWD: 27,
} as const;

/**
 * Dengeli Başlangıç ("balanced start") config (Task 9).
 *
 * MVP squad size is 15 players (2 GK, 5 DEF, 5 MID, 3 FWD) so every manager can
 * field a legal 4-4-2 lineup. Players are distributed by a deterministic snake
 * draft on market value, so squad values stay close and no manager gets an
 * unfair topstar advantage.
 */
export const DENGELI_SQUAD_COMPOSITION = [
  { positionId: POSITION_ID.GK, code: "GK", count: 2 },
  { positionId: POSITION_ID.DEF, code: "DEF", count: 5 },
  { positionId: POSITION_ID.MID, code: "MID", count: 5 },
  { positionId: POSITION_ID.FWD, code: "FWD", count: 3 },
] as const;

export const DENGELI_SQUAD_SIZE = 15;

/**
 * Initial fantasy market value ranges (TL) per position, used only when a
 * player has no market value yet. These are internal game values, not real
 * Sportmonks transfer values. Kept small enough that a balanced 15-man squad
 * costs clearly less than the 100M TL start budget, leaving positive remaining
 * budget. The exact value is derived deterministically from the player's stable
 * Sportmonks id, so reseeding/reruns produce identical values.
 */
export const DENGELI_INITIAL_VALUE_RANGES: Record<
  number,
  { min: number; max: number; step: number }
> = {
  [POSITION_ID.GK]: { min: 2_000_000, max: 5_000_000, step: 500_000 },
  [POSITION_ID.DEF]: { min: 3_000_000, max: 6_000_000, step: 500_000 },
  [POSITION_ID.MID]: { min: 3_000_000, max: 7_000_000, step: 500_000 },
  [POSITION_ID.FWD]: { min: 4_000_000, max: 9_000_000, step: 500_000 },
};

export const DENGELI_LEAGUE = {
  name: "Dengeli Test Ligi",
  inviteCode: "DENGELI-TEST-1",
} as const;

/**
 * Test managers for the Dengeli Başlangıç demo. The player pool only has 4
 * goalkeepers, so at 2 GK per squad only two managers can be fully supplied.
 */
export const DENGELI_MANAGERS = [
  {
    email: "dengeli-a@superlig.local",
    userName: "Dengeli Menajer A",
    teamName: "Dengeli A FC",
  },
  {
    email: "dengeli-b@superlig.local",
    userName: "Dengeli Menajer B",
    teamName: "Dengeli B FC",
  },
] as const;

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
