import { withApiKey } from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShipment,
  type CreateShipmentItemInput,
} from "@/lib/shipments";
import type { TradeChannel, TransportMode } from "@/lib/documents/types";
import { dispatchWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

const CHANNELS: TradeChannel[] = ["import", "export"];
const MODES: TransportMode[] = [
  "sea",
  "air",
  "road",
  "rail",
  "courier",
  "multimodal",
];

type ShipmentListRow = {
  id: string;
  reference: string | null;
  channel: TradeChannel;
  origin_country: string;
  destination_country: string;
  mode: TransportMode;
  status: string;
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function GET(request: Request) {
  const auth = await withApiKey(request);
  if (auth instanceof Response) {
    return auth;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shipments")
    .select(
      "id, reference, channel, origin_country, destination_country, mode, status, created_at",
    )
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return Response.json(
      { error: "Could not list shipments." },
      { status: 500 },
    );
  }

  const shipments = (data as ShipmentListRow[]).map((row) => ({
    id: row.id,
    reference: row.reference,
    channel: row.channel,
    origin: row.origin_country,
    destination: row.destination_country,
    mode: row.mode,
    status: row.status,
    created_at: row.created_at,
  }));

  return Response.json({ shipments });
}

export async function POST(request: Request) {
  const auth = await withApiKey(request);
  if (auth instanceof Response) {
    return auth;
  }

  const raw: unknown = await request.json().catch(() => null);
  if (!isRecord(raw)) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const channel = stringValue(raw.channel);
  const mode = stringValue(raw.mode);
  const originCountry = stringValue(raw.originCountry)?.trim();
  const destinationCountry = stringValue(raw.destinationCountry)?.trim();

  if (!channel || !CHANNELS.includes(channel as TradeChannel)) {
    return Response.json(
      { error: "channel must be import or export." },
      { status: 400 },
    );
  }
  if (!mode || !MODES.includes(mode as TransportMode)) {
    return Response.json(
      { error: "mode is invalid." },
      { status: 400 },
    );
  }
  if (!originCountry || !destinationCountry) {
    return Response.json(
      { error: "originCountry and destinationCountry are required." },
      { status: 400 },
    );
  }

  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  if (itemsRaw.length === 0) {
    return Response.json(
      { error: "At least one line item is required." },
      { status: 400 },
    );
  }

  const items: CreateShipmentItemInput[] = [];
  for (const entry of itemsRaw) {
    if (!isRecord(entry)) {
      return Response.json(
        { error: "Each item must be an object." },
        { status: 400 },
      );
    }
    const description = stringValue(entry.description)?.trim();
    const quantity = numberValue(entry.quantity);
    if (!description) {
      return Response.json(
        { error: "Each item needs a description." },
        { status: 400 },
      );
    }
    if (quantity === null || quantity <= 0) {
      return Response.json(
        { error: "Each item needs a quantity greater than zero." },
        { status: 400 },
      );
    }
    items.push({
      description,
      hsCode: stringValue(entry.hsCode)?.trim() || null,
      quantity,
      unit: stringValue(entry.unit)?.trim() || "unit",
      unitValue: numberValue(entry.unitValue) ?? 0,
      netWeightKg: numberValue(entry.netWeightKg),
      grossWeightKg: numberValue(entry.grossWeightKg),
    });
  }

  const currency = stringValue(raw.currency)?.trim().toUpperCase() || "NGN";
  const reference = stringValue(raw.reference)?.trim() || null;
  const incoterm = stringValue(raw.incoterm)?.trim() || null;
  const incotermPlace = stringValue(raw.incotermPlace)?.trim() || null;

  const admin = createAdminClient();

  let shipmentId: string;
  try {
    shipmentId = await createShipment(
      {
        reference,
        channel: channel as TradeChannel,
        originCountry,
        destinationCountry,
        mode: mode as TransportMode,
        incoterm,
        incotermPlace,
        currency,
        exporterPartyId: null,
        consigneePartyId: null,
        notifyPartyId: null,
        items,
      },
      { client: admin, orgId: auth.orgId, userId: null },
    );
  } catch {
    return Response.json(
      { error: "Could not create the shipment." },
      { status: 500 },
    );
  }

  const { data: created } = await admin
    .from("shipments")
    .select("reference")
    .eq("id", shipmentId)
    .maybeSingle();

  const createdReference =
    (created as { reference: string | null } | null)?.reference ?? reference;

  await dispatchWebhook(auth.orgId, "shipment.created", {
    id: shipmentId,
    reference: createdReference,
    channel,
    originCountry,
    destinationCountry,
    mode,
    itemCount: items.length,
  });

  return Response.json(
    { id: shipmentId, reference: createdReference },
    { status: 201 },
  );
}
