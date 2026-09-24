import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type SyncResult = {
  sourceId: string;
  name: string;
  status: "unchanged" | "changed" | "error";
  message?: string;
};

export type SourceAccessMethod = "api" | "download" | "scrape" | "manual";

export type DataSourceRecord = {
  id: string;
  name: string;
  category: string;
  base_url: string;
  access_method: SourceAccessMethod;
  cadence: string;
  content_hash: string | null;
  last_checked_at: string | null;
  last_changed_at: string | null;
  status: string;
  review_required: boolean;
};

const USER_AGENT = "LadingBot/1.0 (+https://lading.app)";
const REQUEST_TIMEOUT_MS = 20000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeContent(raw: string, accessMethod: string): string {
  if (accessMethod === "scrape") {
    return raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return raw.trim();
}

export function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function isSourceDue(source: DataSourceRecord): boolean {
  if (source.access_method === "manual") {
    return false;
  }

  if (!source.last_checked_at) {
    return true;
  }

  const windowMs =
    source.cadence === "daily"
      ? DAY_MS
      : source.cadence === "weekly"
        ? 7 * DAY_MS
        : null;

  if (windowMs === null) {
    return false;
  }

  const lastChecked = new Date(source.last_checked_at).getTime();
  return Date.now() - lastChecked >= windowMs;
}

export async function syncSource(source: DataSourceRecord): Promise<SyncResult> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(source.base_url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const raw = await response.text();
    const normalized = normalizeContent(raw, source.access_method);
    const newHash = hashContent(normalized);

    if (newHash === source.content_hash) {
      await supabase
        .from("data_sources")
        .update({ last_checked_at: now, status: "ok" })
        .eq("id", source.id);

      return { sourceId: source.id, name: source.name, status: "unchanged" };
    }

    await supabase
      .from("data_sources")
      .update({
        content_hash: newHash,
        last_changed_at: now,
        last_checked_at: now,
        status: "ok",
      })
      .eq("id", source.id);

    const excerpt = normalized.slice(0, 400);

    await supabase.from("source_snapshots").insert({
      source_id: source.id,
      content_hash: newHash,
      raw_ref: source.base_url,
      diff_summary: excerpt,
    });

    await supabase.from("staged_changes").insert({
      source_id: source.id,
      entity_type: source.category,
      entity_key: source.name,
      old_value: { hash: source.content_hash },
      new_value: { hash: newHash, excerpt },
      status: "pending",
    });

    return { sourceId: source.id, name: source.name, status: "changed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await supabase
      .from("data_sources")
      .update({ status: "degraded", last_checked_at: now })
      .eq("id", source.id);

    await supabase.from("source_snapshots").insert({
      source_id: source.id,
      diff_summary: message,
    });

    return {
      sourceId: source.id,
      name: source.name,
      status: "error",
      message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runSourceSync(sourceId: string): Promise<SyncResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("data_sources")
    .select("*")
    .eq("id", sourceId)
    .maybeSingle();

  if (error || !data) {
    return {
      sourceId,
      name: sourceId,
      status: "error",
      message: "Source not found.",
    };
  }

  return syncSource(data as DataSourceRecord);
}

export async function runDueSources(): Promise<SyncResult[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("data_sources")
    .select("*")
    .neq("access_method", "manual");

  if (error || !data) {
    return [];
  }

  const due = (data as DataSourceRecord[]).filter(isSourceDue);
  const results: SyncResult[] = [];

  for (const source of due) {
    try {
      results.push(await syncSource(source));
    } catch (error) {
      results.push({
        sourceId: source.id,
        name: source.name,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
