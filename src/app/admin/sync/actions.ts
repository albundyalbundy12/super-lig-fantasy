"use server";

import { revalidatePath } from "next/cache";

import { TEST_FIXTURE_ID } from "@/config/constants";
import { syncFixture } from "@/lib/sync";

/**
 * Minimal admin trigger (Task 4): sync the test fixture so we can verify the
 * fixture sync end-to-end and confirm it is idempotent. No scoring here.
 */
export async function syncTestFixtureAction(): Promise<void> {
  await syncFixture(TEST_FIXTURE_ID);
  revalidatePath("/admin/sync");
}
