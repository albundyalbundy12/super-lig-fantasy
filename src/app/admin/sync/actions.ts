"use server";

import { revalidatePath } from "next/cache";

import { TEST_FIXTURE_ID } from "@/config/constants";
import { syncFixture } from "@/lib/sync";
import { scoreFixturePlayers, scoreTestManager } from "@/lib/scoring";

/**
 * Minimal admin trigger (Task 4): sync the test fixture so we can verify the
 * fixture sync end-to-end and confirm it is idempotent. No scoring here.
 */
export async function syncTestFixtureAction(): Promise<void> {
  await syncFixture(TEST_FIXTURE_ID);
  revalidatePath("/admin/sync");
}

/**
 * Minimal admin trigger (Task 5): calculate player match scores for the test
 * fixture from already-synced raw data. Idempotent — safe to run repeatedly.
 */
export async function calculatePlayerScoresAction(): Promise<void> {
  await scoreFixturePlayers(TEST_FIXTURE_ID);
  revalidatePath("/admin/sync");
}

/**
 * Minimal admin trigger (Task 6): build a simulated test manager (user, league,
 * team, squad, lineup) from real fixture players and score the manager's round
 * from already-calculated player_match_scores. Idempotent — safe to rerun.
 */
export async function createTestManagerScoreAction(): Promise<void> {
  await scoreTestManager(TEST_FIXTURE_ID);
  revalidatePath("/admin/sync");
}
