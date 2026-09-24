import { getActiveOrg } from "@/lib/auth";
import {
  PARTY_TYPES,
  type ImportSummary,
  type Party,
  type PartyInput,
  type PartyType,
} from "@/lib/party-types";
import { createClient } from "@/lib/supabase/server";

export { PARTY_TYPES };
export type { ImportSummary, Party, PartyInput, PartyType };

function clean(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function listParties(): Promise<Party[]> {
  const organization = await getActiveOrg();
  if (!organization) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("org_id", organization.id)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Party[];
}

export async function getParty(id: string): Promise<Party | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Party;
}

export async function upsertParty(input: PartyInput): Promise<Party> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }
  const name = input.name.trim();
  if (!name) {
    throw new Error("Party name is required.");
  }

  const record = {
    org_id: organization.id,
    type: input.type,
    name,
    address: clean(input.address),
    country: clean(input.country),
    contact_name: clean(input.contactName),
    contact_email: clean(input.contactEmail),
    contact_phone: clean(input.contactPhone),
    tax_id: clean(input.taxId),
  };

  const supabase = await createClient();

  if (input.id) {
    const { data, error } = await supabase
      .from("parties")
      .update(record)
      .eq("id", input.id)
      .eq("org_id", organization.id)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Could not update the party.");
    }
  return data as Party;
}

  const { data, error } = await supabase
    .from("parties")
    .insert(record)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Could not create the party.");
  }

  return data as Party;
}

export async function deleteParty(id: string): Promise<void> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("parties")
    .delete()
    .eq("id", id)
    .eq("org_id", organization.id);

  if (error) {
    throw new Error("Could not delete the party.");
  }
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

  return rows.filter((entry) => entry.some((value) => value.trim() !== ""));
}

export async function importPartiesCsv(csvText: string): Promise<ImportSummary> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { created: 0, updated: 0, skipped: 0 };
  }

  const header = rows[0].map((value) => value.trim().toLowerCase());
  const column = (name: string) => header.indexOf(name);
  const typeIndex = column("type");
  const nameIndex = column("name");
  const addressIndex = column("address");
  const countryIndex = column("country");
  const contactNameIndex = column("contact_name");
  const contactEmailIndex = column("contact_email");
  const contactPhoneIndex = column("contact_phone");
  const taxIdIndex = column("tax_id");

  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, updated: 0, skipped: 0 };

  for (const row of rows.slice(1)) {
    const type = (row[typeIndex] ?? "").trim().toLowerCase();
    const name = (row[nameIndex] ?? "").trim();

    if (!(PARTY_TYPES as readonly string[]).includes(type) || !name) {
      summary.skipped += 1;
      continue;
    }

    const record = {
      address: clean(row[addressIndex]),
      country: clean(row[countryIndex]),
      contact_name: clean(row[contactNameIndex]),
      contact_email: clean(row[contactEmailIndex]),
      contact_phone: clean(row[contactPhoneIndex]),
      tax_id: clean(row[taxIdIndex]),
    };

    const { data: existing } = await supabase
      .from("parties")
      .select("id")
      .eq("org_id", organization.id)
      .eq("type", type)
      .eq("name", name)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("parties")
        .update(record)
        .eq("id", (existing as { id: string }).id)
        .eq("org_id", organization.id);

      if (error) {
        summary.skipped += 1;
      } else {
        summary.updated += 1;
      }
    } else {
      const { error } = await supabase.from("parties").insert({
        org_id: organization.id,
        type,
        name,
        ...record,
      });

      if (error) {
        summary.skipped += 1;
      } else {
        summary.created += 1;
      }
    }
  }

  return summary;
}
