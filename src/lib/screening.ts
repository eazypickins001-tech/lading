import { getShipmentWithItems } from "@/lib/shipments";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CSL_URL =
  "https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.csv";
const CSL_USER_AGENT = "LadingBot/1.0 (+https://lading.app)";
const UPSERT_BATCH_SIZE = 500;
const MATCH_THRESHOLD = 0.6;

export type ScreeningMatch = {
  id: string;
  name: string;
  source: string | null;
  entity_type: string | null;
  country: string | null;
  score: number;
};

export type ScreeningResult = {
  id: string;
  org_id: string;
  shipment_id: string;
  party_type: string | null;
  party_name: string | null;
  matched_name: string | null;
  source: string | null;
  score: number | null;
  created_at: string;
};

type ScreeningEntryInsert = {
  source: string | null;
  name: string;
  name_normalized: string;
  entity_type: string | null;
  country: string | null;
  program: string | null;
  aliases: string[];
  raw: Record<string, string>;
};

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function clean(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstCountry(addresses: string | undefined): string | null {
  const first = (addresses ?? "").split(";")[0]?.trim() ?? "";
  if (!first) {
    return null;
  }
  const parts = first.split(",");
  const last = (parts[parts.length - 1] ?? "").trim();
  return /^[A-Z]{2}$/.test(last) ? last : null;
}

function splitAliases(value: string | undefined): string[] {
  return (value ?? "")
    .split(";")
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function mapRow(
  header: string[],
  row: string[],
): ScreeningEntryInsert | null {
  const record: Record<string, string> = {};
  for (let index = 0; index < header.length; index += 1) {
    record[header[index]] = row[index] ?? "";
  }

  const name = clean(record.name);
  if (!name) {
    return null;
  }

  const normalized = normalizeName(name);
  if (!normalized) {
    return null;
  }

  return {
    source: clean(record.source),
    name,
    name_normalized: normalized,
    entity_type: clean(record.type),
    country: firstCountry(record.addresses),
    program: clean(record.programs),
    aliases: splitAliases(record.alt_names),
    raw: record,
  };
}

export async function ingestCsl(): Promise<{
  inserted: number;
  skipped: number;
}> {
  let text: string;
  try {
    const response = await fetch(CSL_URL, {
      headers: { "User-Agent": CSL_USER_AGENT },
    });
    if (!response.ok) {
      return { inserted: 0, skipped: 0 };
    }
    text = await response.text();
  } catch {
    return { inserted: 0, skipped: 0 };
  }

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { inserted: 0, skipped: 0 };
  }

  const header = rows[0].map((value) => value.trim());
  let skipped = 0;
  const entries = new Map<string, ScreeningEntryInsert>();

  for (const row of rows.slice(1)) {
    try {
      const entry = mapRow(header, row);
      if (!entry) {
        skipped += 1;
        continue;
      }
      entries.set(`${entry.source ?? ""}::${entry.name_normalized}`, entry);
    } catch {
      skipped += 1;
    }
  }

  const values = Array.from(entries.values());
  const supabase = createAdminClient();
  let inserted = 0;

  for (let index = 0; index < values.length; index += UPSERT_BATCH_SIZE) {
    const batch = values.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase
      .from("screening_entries")
      .upsert(batch, { onConflict: "source,name_normalized" });

    if (error) {
      skipped += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, skipped };
}

export async function screenName(
  name: string,
  limit = 10,
): Promise<ScreeningMatch[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("screen_name", {
    p_name: query,
    p_limit: limit,
  });

  if (error || !data) {
    return [];
  }

  return (data as ScreeningMatch[]).map((match) => ({
    id: match.id,
    name: match.name,
    source: match.source,
    entity_type: match.entity_type,
    country: match.country,
    score: match.score,
  }));
}

export async function screenShipmentParties(
  shipmentId: string,
): Promise<ScreeningResult[]> {
  const shipment = await getShipmentWithItems(shipmentId);
  if (!shipment) {
    return [];
  }

  const parties: { type: string; name: string }[] = [];
  if (shipment.exporter?.name) {
    parties.push({ type: "exporter", name: shipment.exporter.name });
  }
  if (shipment.consignee?.name) {
    parties.push({ type: "consignee", name: shipment.consignee.name });
  }
  if (shipment.notify?.name) {
    parties.push({ type: "notify", name: shipment.notify.name });
  }

  const supabase = await createClient();
  const results: ScreeningResult[] = [];

  for (const party of parties) {
    const matches = await screenName(party.name);
    const strong = matches.filter((match) => match.score >= MATCH_THRESHOLD);

    for (const match of strong) {
      const { data, error } = await supabase
        .from("screening_results")
        .insert({
          org_id: shipment.org_id,
          shipment_id: shipmentId,
          party_type: party.type,
          party_name: party.name,
          matched_name: match.name,
          source: match.source,
          score: match.score,
        })
        .select("*")
        .maybeSingle();

      if (!error && data) {
        results.push(data as ScreeningResult);
      }
    }
  }

  return results;
}

export async function listScreeningResults(
  orgId: string,
): Promise<ScreeningResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screening_results")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ScreeningResult[];
}
