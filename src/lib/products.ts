import { getActiveOrg } from "@/lib/auth";
import type { ImportSummary } from "@/lib/party-types";
import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  org_id: string;
  description: string;
  hs_code: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  id?: string | null;
  description: string;
  hsCode?: string | null;
};

function clean(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
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

export async function listProducts(): Promise<Product[]> {
  const organization = await getActiveOrg();
  if (!organization) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("org_id", organization.id)
    .order("description", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Product[];
}

export async function upsertProduct(input: ProductInput): Promise<Product> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }
  const description = input.description.trim();
  if (!description) {
    throw new Error("Product description is required.");
  }

  const record = {
    org_id: organization.id,
    description,
    hs_code: clean(input.hsCode),
  };

  const supabase = await createClient();

  if (input.id) {
    const { data, error } = await supabase
      .from("products")
      .update(record)
      .eq("id", input.id)
      .eq("org_id", organization.id)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Could not update the product.");
    }
    return data as Product;
  }

  const { data, error } = await supabase
    .from("products")
    .insert(record)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Could not create the product.");
  }

  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("org_id", organization.id);

  if (error) {
    throw new Error("Could not delete the product.");
  }
}

export async function importProductsCsv(
  csvText: string,
): Promise<ImportSummary> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { created: 0, updated: 0, skipped: 0 };
  }

  const header = rows[0].map((value) => value.trim().toLowerCase());
  const descriptionIndex = header.indexOf("description");
  const hsCodeIndex = header.indexOf("hs_code");

  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, updated: 0, skipped: 0 };

  for (const row of rows.slice(1)) {
    const description = (row[descriptionIndex] ?? "").trim();
    if (!description) {
      summary.skipped += 1;
      continue;
    }

    const record = { hs_code: clean(row[hsCodeIndex]) };

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("org_id", organization.id)
      .eq("description", description)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("products")
        .update(record)
        .eq("id", (existing as { id: string }).id)
        .eq("org_id", organization.id);

      if (error) {
        summary.skipped += 1;
      } else {
        summary.updated += 1;
      }
    } else {
      const { error } = await supabase.from("products").insert({
        org_id: organization.id,
        description,
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
