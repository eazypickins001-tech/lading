import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocType, TradeChannel } from "@/lib/documents/types";
import { createClient } from "@/lib/supabase/server";
import type { ShipmentWithItems } from "@/lib/shipments";

export type RequirementInput = {
  hsCode: string | null;
  originCountry: string;
  destinationCountry: string;
  channel: TradeChannel;
  attributes?: Record<string, boolean>;
};

export type RequiredDocument = {
  docType: DocType;
  authority: string | null;
  notes: string | null;
  sourceUrl: string | null;
  required: boolean;
  conditionKeys: string[];
};

type RequirementRuleRow = {
  hs_prefix: string;
  origin_country: string | null;
  destination_country: string | null;
  channel: TradeChannel;
  doc_type: DocType;
  authority: string | null;
  condition: Record<string, unknown> | null;
  notes: string | null;
  source_url: string | null;
  effective_from: string | null;
  is_active: boolean;
};

type EvaluatedDocument = RequiredDocument & { specificity: number };

function normalizeHsCode(value: string): string {
  return value.replace(/[\s.]/g, "");
}

function keysOf(condition: Record<string, unknown> | null): string[] {
  return condition ? Object.keys(condition) : [];
}

function isRequired(
  condition: Record<string, unknown> | null,
  attributes: Record<string, boolean>,
): boolean {
  if (!condition) {
    return true;
  }
  const keys = Object.keys(condition);
  if (keys.length === 0) {
    return true;
  }
  if (condition.all_imports === true || condition.all_exports === true) {
    return true;
  }
  const active = keys.filter((key) => condition[key] === true);
  return active.every((key) => attributes[key] === true);
}

function matchesRule(
  rule: RequirementRuleRow,
  input: RequirementInput,
): boolean {
  const hsMatches =
    rule.hs_prefix === "" ||
    (input.hsCode !== null &&
      normalizeHsCode(input.hsCode).startsWith(rule.hs_prefix));
  const originMatches =
    rule.origin_country === null || rule.origin_country === input.originCountry;
  const destinationMatches =
    rule.destination_country === null ||
    rule.destination_country === input.destinationCountry;
  return hsMatches && originMatches && destinationMatches;
}

function evaluateRule(
  rule: RequirementRuleRow,
  input: RequirementInput,
  attributes: Record<string, boolean>,
): EvaluatedDocument {
  const matchedPrefix =
    rule.hs_prefix !== "" &&
    input.hsCode !== null &&
    normalizeHsCode(input.hsCode).startsWith(rule.hs_prefix);
  const required = isRequired(rule.condition, attributes);
  return {
    docType: rule.doc_type,
    authority: rule.authority,
    notes: rule.notes,
    sourceUrl: rule.source_url,
    required,
    conditionKeys: keysOf(rule.condition),
    specificity: (matchedPrefix ? 10 : 0) + (required ? 1 : 0),
  };
}

function dedupe(documents: EvaluatedDocument[]): RequiredDocument[] {
  const byType = new Map<DocType, EvaluatedDocument>();
  for (const document of documents) {
    const existing = byType.get(document.docType);
    if (!existing) {
      byType.set(document.docType, document);
      continue;
    }
    const best =
      document.specificity > existing.specificity ? document : existing;
    byType.set(document.docType, {
      ...best,
      required: existing.required || document.required,
    });
  }
  return [...byType.values()]
    .map((document) => ({
      docType: document.docType,
      authority: document.authority,
      notes: document.notes,
      sourceUrl: document.sourceUrl,
      required: document.required,
      conditionKeys: document.conditionKeys,
    }))
    .sort((a, b) => {
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      return a.docType.localeCompare(b.docType);
    });
}

async function fetchRules(
  channel: TradeChannel,
  client?: SupabaseClient,
): Promise<RequirementRuleRow[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("requirement_rules")
    .select(
      "hs_prefix, origin_country, destination_country, channel, doc_type, authority, condition, notes, source_url, effective_from, is_active",
    )
    .eq("channel", channel)
    .eq("is_active", true);

  if (error || !data) {
    return [];
  }

  return data as RequirementRuleRow[];
}

export async function getRequiredDocuments(
  input: RequirementInput,
  client?: SupabaseClient,
): Promise<RequiredDocument[]> {
  const rules = await fetchRules(input.channel, client);
  const attributes = input.attributes ?? {};
  const evaluated = rules
    .filter((rule) => matchesRule(rule, input))
    .map((rule) => evaluateRule(rule, input, attributes));
  return dedupe(evaluated);
}

export async function getShipmentRequirements(
  shipment: ShipmentWithItems,
  client?: SupabaseClient,
): Promise<RequiredDocument[]> {
  const rules = await fetchRules(shipment.channel, client);
  const items = shipment.items.length > 0 ? shipment.items : [{ hs_code: null }];
  const evaluated: EvaluatedDocument[] = [];
  for (const item of items) {
    const input: RequirementInput = {
      hsCode: item.hs_code,
      originCountry: shipment.origin_country,
      destinationCountry: shipment.destination_country,
      channel: shipment.channel,
    };
    for (const rule of rules) {
      if (matchesRule(rule, input)) {
        evaluated.push(evaluateRule(rule, input, {}));
      }
    }
  }
  return dedupe(evaluated);
}
