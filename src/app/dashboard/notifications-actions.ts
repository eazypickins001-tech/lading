"use server";

import { markAllRead } from "@/lib/notifications";

export async function markAllReadAction(): Promise<void> {
  await markAllRead();
}
