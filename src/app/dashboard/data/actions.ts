"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { ensureAllPaystackPlans } from "@/lib/payment-plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDueSources, runSourceSync } from "@/lib/sync/engine";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
}

export async function runSourceSyncAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const sourceId = String(formData.get("sourceId") ?? "").trim();
  if (!sourceId) {
    return;
  }

  await runSourceSync(sourceId);
  revalidatePath("/dashboard/data");
}

export async function runAllSyncAction(): Promise<void> {
  await requireAdmin();
  await runDueSources();
  revalidatePath("/dashboard/data");
}

export async function syncPaystackPlansAction(): Promise<void> {
  await requireAdmin();
  await ensureAllPaystackPlans();
  revalidatePath("/dashboard/data");
}

export async function approveChangeAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const changeId = String(formData.get("changeId") ?? "").trim();
  if (!changeId) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("staged_changes")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", changeId);

  revalidatePath("/dashboard/data");
}

export async function rejectChangeAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const changeId = String(formData.get("changeId") ?? "").trim();
  if (!changeId) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("staged_changes")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", changeId);

  revalidatePath("/dashboard/data");
}
