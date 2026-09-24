"use server";

import { redirect } from "next/navigation";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import type { TradeChannel, TransportMode } from "@/lib/documents/types";
import { createShipment, type CreateShipmentItemInput } from "@/lib/shipments";

const CHANNELS: TradeChannel[] = ["import", "export"];
const MODES: TransportMode[] = [
  "sea",
  "air",
  "road",
  "rail",
  "courier",
  "multimodal",
];

export type CreateShipmentState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

function parseNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createShipmentAction(
  state: CreateShipmentState,
  formData: FormData,
): Promise<CreateShipmentState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const reference = String(formData.get("reference") ?? "").trim() || null;
  const channelValue = String(formData.get("channel") ?? "import");
  const originCountry = String(formData.get("originCountry") ?? "").trim();
  const destinationCountry = String(
    formData.get("destinationCountry") ?? "",
  ).trim();
  const modeValue = String(formData.get("mode") ?? "sea");
  const incoterm = String(formData.get("incoterm") ?? "").trim() || null;
  const incotermPlace =
    String(formData.get("incotermPlace") ?? "").trim() || null;
  const currency =
    String(formData.get("currency") ?? "NGN")
      .trim()
      .toUpperCase() || "NGN";

  const fieldErrors: Record<string, string> = {};
  if (!originCountry) {
    fieldErrors.originCountry = "Origin country is required.";
  }
  if (!destinationCountry) {
    fieldErrors.destinationCountry = "Destination country is required.";
  }

  const descriptions = formData
    .getAll("itemDescription")
    .map((value) => String(value));
  const hsCodes = formData.getAll("itemHsCode").map((value) => String(value));
  const quantities = formData.getAll("itemQuantity");
  const units = formData.getAll("itemUnit").map((value) => String(value));
  const unitValues = formData.getAll("itemUnitValue");
  const netWeights = formData.getAll("itemNetWeight");
  const grossWeights = formData.getAll("itemGrossWeight");

  const items: CreateShipmentItemInput[] = [];
  for (let index = 0; index < descriptions.length; index += 1) {
    const description = descriptions[index].trim();
    const hsCode = (hsCodes[index] ?? "").trim();
    const quantity = parseNumber(quantities[index] ?? null);
    const hasValue =
      description.length > 0 || hsCode.length > 0 || quantity !== null;
    if (!hasValue) {
      continue;
    }
    if (!description) {
      fieldErrors.items = "Every line item needs a description.";
      continue;
    }
    if (quantity === null || quantity <= 0) {
      fieldErrors.items = "Every line item needs a quantity greater than zero.";
      continue;
    }
    items.push({
      description,
      hsCode: hsCode || null,
      quantity,
      unit: (units[index] ?? "").trim() || "unit",
      unitValue: parseNumber(unitValues[index] ?? null) ?? 0,
      netWeightKg: parseNumber(netWeights[index] ?? null),
      grossWeightKg: parseNumber(grossWeights[index] ?? null),
    });
  }

  if (items.length === 0) {
    fieldErrors.items =
      fieldErrors.items ?? "Add at least one line item to the shipment.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please correct the highlighted fields.", fieldErrors };
  }

  const channel = CHANNELS.includes(channelValue as TradeChannel)
    ? (channelValue as TradeChannel)
    : "import";
  const mode = MODES.includes(modeValue as TransportMode)
    ? (modeValue as TransportMode)
    : "sea";

  const shipmentId = await createShipment({
    reference,
    channel,
    originCountry,
    destinationCountry,
    mode,
    incoterm,
    incotermPlace,
    currency,
    items,
  });

  redirect(`/dashboard/shipments/${shipmentId}`);
}
