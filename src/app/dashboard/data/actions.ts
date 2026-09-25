"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminEmails, isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { ensureAllPaystackPlans } from "@/lib/payment-plans";
import { ingestCsl } from "@/lib/screening";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDueSources, runSourceSync } from "@/lib/sync/engine";

type ParsedFxItem = {
  currency: string;
  rateNgn: number;
};

type ParsedFx = {
  kind: "fx";
  items: ParsedFxItem[];
};

type StagedChangeForApproval = {
  entity_type: string;
  new_value: unknown;
  data_sources: { base_url: string } | { base_url: string }[] | null;
};

function readParsedFx(value: unknown): ParsedFx | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const parsed = (value as { parsed?: unknown }).parsed;
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const kind = (parsed as { kind?: unknown }).kind;
  const items = (parsed as { items?: unknown }).items;

  if (kind !== "fx" || !Array.isArray(items)) {
    return null;
  }

  const valid = items.filter((item): item is ParsedFxItem => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const candidate = item as { currency?: unknown; rateNgn?: unknown };
    return (
      typeof candidate.currency === "string" &&
      typeof candidate.rateNgn === "number" &&
      Number.isFinite(candidate.rateNgn)
    );
  });

  return valid.length > 0 ? { kind: "fx", items: valid } : null;
}

function sourceBaseUrl(value: StagedChangeForApproval["data_sources"]): string | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0]?.base_url ?? null;
  }
  return value.base_url;
}

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

export async function ingestScreeningListAction(): Promise<void> {
  await requireAdmin();
  await ingestCsl();
  revalidatePath("/dashboard/data");
}

export async function approveChangeAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const changeId = String(formData.get("changeId") ?? "").trim();
  if (!changeId) {
    return;
  }

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("staged_changes")
    .select("entity_type, new_value, data_sources(base_url)")
    .eq("id", changeId)
    .maybeSingle();

  await supabase
    .from("staged_changes")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", changeId);

  const change = (data ?? null) as StagedChangeForApproval | null;
  const parsed = readParsedFx(change?.new_value);

  if (change?.entity_type === "fx" && parsed) {
    const sourceUrl = sourceBaseUrl(change.data_sources);
    const effectiveDate = new Date().toISOString().slice(0, 10);

    await supabase.from("fx_rates").upsert(
      parsed.items.map((item) => ({
        currency: item.currency,
        rate_ngn: item.rateNgn,
        source_url: sourceUrl,
        effective_date: effectiveDate,
      })),
      { onConflict: "currency,effective_date" },
    );
  }

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

export async function syncPlatformAdminsAction(): Promise<void> {
  await requireAdmin();

  const emails = adminEmails();
  if (emails.length === 0) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("platform_admins")
    .upsert(
      emails.map((email) => ({ email })),
      { onConflict: "email" },
    );

  revalidatePath("/dashboard/data");
}
