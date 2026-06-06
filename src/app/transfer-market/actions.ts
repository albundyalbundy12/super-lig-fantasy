"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buyPlayer, sellPlayer } from "@/lib/transfer/market";

function redirectWith(status: string, playerName?: string): never {
  const params = new URLSearchParams({ msg: status });
  if (playerName) params.set("ad", playerName);
  redirect(`/transfer-market?${params.toString()}`);
}

export async function buyPlayerAction(formData: FormData): Promise<void> {
  const playerId = Number(formData.get("playerId"));
  if (!Number.isInteger(playerId)) redirectWith("not_found");

  const result = await buyPlayer(playerId);
  revalidatePath("/transfer-market");
  revalidatePath("/squad");
  revalidatePath("/table");
  redirectWith(result.status, result.playerName);
}

export async function sellPlayerAction(formData: FormData): Promise<void> {
  const playerId = Number(formData.get("playerId"));
  if (!Number.isInteger(playerId)) redirectWith("not_found");

  const result = await sellPlayer(playerId);
  revalidatePath("/transfer-market");
  revalidatePath("/squad");
  revalidatePath("/table");
  redirectWith(result.status, result.playerName);
}
