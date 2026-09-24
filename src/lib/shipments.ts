import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  DocType,
  DocumentParty,
  ShipmentDocumentPayload,
  ShipmentStatus,
  TradeChannel,
  TransportMode,
} from "@/lib/documents/types";

export type Shipment = {
  id: string;
  org_id: string;
  reference: string | null;
  channel: TradeChannel;
  origin_country: string;
  destination_country: string;
  mode: TransportMode;
  incoterm: string | null;
  incoterm_place: string | null;
  currency: string;
  status: ShipmentStatus;
  exporter_party_id: string | null;
  consignee_party_id: string | null;
  agent_org_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ShipmentItem = {
  id: string;
  shipment_id: string;
  product_id: string | null;
  description: string;
  hs_code: string | null;
  quantity: number;
  unit: string;
  unit_value: number;
  currency: string;
  net_weight_kg: number | null;
  gross_weight_kg: number | null;
  created_at: string;
};

export type ShipmentListItem = Shipment & { itemCount: number };

export type ShipmentWithItems = Shipment & {
  items: ShipmentItem[];
  organization: { id: string; name: string; country: string | null };
  incotermName: string | null;
  exporter: DocumentParty | null;
  consignee: DocumentParty | null;
};

export type CreateShipmentItemInput = {
  description: string;
  hsCode: string | null;
  quantity: number;
  unit: string;
  unitValue: number;
  netWeightKg: number | null;
  grossWeightKg: number | null;
};

export type CreateShipmentInput = {
  reference: string | null;
  channel: TradeChannel;
  originCountry: string;
  destinationCountry: string;
  mode: TransportMode;
  incoterm: string | null;
  incotermPlace: string | null;
  currency: string;
  items: CreateShipmentItemInput[];
};

export type Incoterm = { code: string; name: string; modeScope: string[] };

export type DashboardCounts = {
  shipments: number;
  documents: number;
  findings: number;
  dataSources: number;
};

type MaybeArray<T> = T | T[] | null;

type ShipmentRow = {
  id: string;
  org_id: string;
  reference: string | null;
  channel: TradeChannel;
  origin_country: string;
  destination_country: string;
  mode: TransportMode;
  incoterm: string | null;
  incoterm_place: string | null;
  currency: string;
  status: ShipmentStatus;
  exporter_party_id: string | null;
  consignee_party_id: string | null;
  agent_org_id: string | null;
  created_at: string;
  updated_at: string;
};

type ShipmentItemRow = {
  id: string;
  shipment_id: string;
  product_id: string | null;
  description: string;
  hs_code: string | null;
  quantity: number | string;
  unit: string;
  unit_value: number | string;
  currency: string;
  net_weight_kg: number | string | null;
  gross_weight_kg: number | string | null;
  created_at: string;
};

type PartyRow = {
  id: string;
  name: string;
  address: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tax_id: string | null;
};

type ShipmentDetailRow = ShipmentRow & {
  shipment_items: ShipmentItemRow[] | null;
  organization: MaybeArray<{ id: string; name: string; country: string | null }>;
  incoterms: MaybeArray<{ name: string }>;
  exporter: MaybeArray<PartyRow>;
  consignee: MaybeArray<PartyRow>;
};

function first<T>(value: MaybeArray<T>): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toShipment(row: ShipmentRow): Shipment {
  return {
    id: row.id,
    org_id: row.org_id,
    reference: row.reference,
    channel: row.channel,
    origin_country: row.origin_country,
    destination_country: row.destination_country,
    mode: row.mode,
    incoterm: row.incoterm,
    incoterm_place: row.incoterm_place,
    currency: row.currency,
    status: row.status,
    exporter_party_id: row.exporter_party_id,
    consignee_party_id: row.consignee_party_id,
    agent_org_id: row.agent_org_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toShipmentItem(row: ShipmentItemRow): ShipmentItem {
  return {
    id: row.id,
    shipment_id: row.shipment_id,
    product_id: row.product_id,
    description: row.description,
    hs_code: row.hs_code,
    quantity: toNumber(row.quantity) ?? 0,
    unit: row.unit,
    unit_value: toNumber(row.unit_value) ?? 0,
    currency: row.currency,
    net_weight_kg: toNumber(row.net_weight_kg),
    gross_weight_kg: toNumber(row.gross_weight_kg),
    created_at: row.created_at,
  };
}

function toParty(row: PartyRow): DocumentParty {
  return {
    name: row.name,
    address: row.address,
    country: row.country,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    taxId: row.tax_id,
  };
}

export async function listShipments(): Promise<ShipmentListItem[]> {
  const organization = await getActiveOrg();
  if (!organization) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*, shipment_items(count)")
    .eq("org_id", organization.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (
    data as (ShipmentRow & { shipment_items: { count: number }[] })[]
  ).map((row) => ({
    ...toShipment(row),
    itemCount: row.shipment_items?.[0]?.count ?? 0,
  }));
}

export async function getShipmentWithItems(
  id: string,
): Promise<ShipmentWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select(
      "*, shipment_items(*), organization:organizations!org_id(id, name, country), incoterms(name), exporter:parties!exporter_party_id(id, name, address, country, contact_name, contact_email, contact_phone, tax_id), consignee:parties!consignee_party_id(id, name, address, country, contact_name, contact_email, contact_phone, tax_id)",
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "shipment_items", ascending: true })
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ShipmentDetailRow;
  const organization = first(row.organization);
  const incoterm = first(row.incoterms);
  const exporter = first(row.exporter);
  const consignee = first(row.consignee);

  return {
    ...toShipment(row),
    items: (row.shipment_items ?? []).map(toShipmentItem),
    organization: {
      id: organization?.id ?? "",
      name: organization?.name ?? "",
      country: organization?.country ?? null,
    },
    incotermName: incoterm?.name ?? null,
    exporter: exporter ? toParty(exporter) : null,
    consignee: consignee ? toParty(consignee) : null,
  };
}

export async function createShipment(
  input: CreateShipmentInput,
): Promise<string> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: shipment, error } = await supabase
    .from("shipments")
    .insert({
      org_id: organization.id,
      reference: input.reference,
      channel: input.channel,
      origin_country: input.originCountry,
      destination_country: input.destinationCountry,
      mode: input.mode,
      incoterm: input.incoterm,
      incoterm_place: input.incotermPlace,
      currency: input.currency,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !shipment) {
    throw new Error("Could not create the shipment.");
  }

  const shipmentId = (shipment as { id: string }).id;

  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from("shipment_items").insert(
      input.items.map((item) => ({
        shipment_id: shipmentId,
        description: item.description,
        hs_code: item.hsCode,
        quantity: item.quantity,
        unit: item.unit,
        unit_value: item.unitValue,
        currency: input.currency,
        net_weight_kg: item.netWeightKg,
        gross_weight_kg: item.grossWeightKg,
      })),
    );

    if (itemsError) {
      throw new Error("Could not save the shipment line items.");
    }
  }

  return shipmentId;
}

export async function recordDocumentGenerated(
  shipmentId: string,
  docType: DocType,
  data: Record<string, unknown>,
): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("shipment_documents").insert({
    shipment_id: shipmentId,
    doc_type: docType,
    data,
    status: "generated",
    generated_by: user?.id ?? null,
    generated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error("Could not record the generated document.");
  }
}

export async function listIncoterms(): Promise<Incoterm[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incoterms")
    .select("code, name, mode_scope")
    .order("code", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as { code: string; name: string; mode_scope: string[] }[]).map(
    (row) => ({
      code: row.code,
      name: row.name,
      modeScope: row.mode_scope ?? [],
    }),
  );
}

export async function getDashboardCounts(
  orgId: string,
): Promise<DashboardCounts> {
  const supabase = await createClient();
  const [shipments, documents, findings, dataSources] = await Promise.all([
    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
    supabase
      .from("shipment_documents")
      .select("id, shipments!inner(org_id)", { count: "exact", head: true })
      .eq("shipments.org_id", orgId),
    supabase
      .from("consistency_findings")
      .select("id, shipments!inner(org_id)", { count: "exact", head: true })
      .eq("shipments.org_id", orgId),
    supabase.from("data_sources").select("id", { count: "exact", head: true }),
  ]);

  return {
    shipments: shipments.count ?? 0,
    documents: documents.count ?? 0,
    findings: findings.count ?? 0,
    dataSources: dataSources.count ?? 0,
  };
}

export function toDocumentPayload(
  shipment: ShipmentWithItems,
): ShipmentDocumentPayload {
  return {
    reference: shipment.reference,
    channel: shipment.channel,
    originCountry: shipment.origin_country,
    destinationCountry: shipment.destination_country,
    mode: shipment.mode,
    incoterm: shipment.incoterm,
    incotermName: shipment.incotermName,
    incotermPlace: shipment.incoterm_place,
    currency: shipment.currency,
    status: shipment.status,
    createdAt: shipment.created_at,
    organization: {
      name: shipment.organization.name,
      country: shipment.organization.country,
    },
    exporter: shipment.exporter,
    consignee: shipment.consignee,
    items: shipment.items.map((item) => ({
      description: item.description,
      hsCode: item.hs_code,
      quantity: item.quantity,
      unit: item.unit,
      unitValue: item.unit_value,
      netWeightKg: item.net_weight_kg,
      grossWeightKg: item.gross_weight_kg,
    })),
  };
}
