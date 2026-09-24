"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { getEntitlement, incrementUsage } from "@/lib/billing";
import { runConsistencyChecks } from "@/lib/consistency";
import { replaceFindings, setFindingResolved } from "@/lib/consistency-store";
import type { TradeChannel, TransportMode } from "@/lib/documents/types";
import { suggestHsCodes, type HsSuggestion } from "@/lib/hs-suggest";
import { createShipment, getShipmentWithItems, type CreateShipmentItemInput } from "@/lib/shipments";
import { getEffectivePlan } from "@/lib/subscriptions";

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

export type SuggestHsForLineResult =
  | { status: "success"; suggestions: HsSuggestion[] }
  | { status: "error"; message: string };

export async function suggestHsForLineAction(
  formData: FormData,
): Promise<SuggestHsForLineResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Please sign in to use the assistant." };
  }

  const description = String(formData.get("description") ?? "").trim();
  const destination =
    String(formData.get("destination") ?? "NG").trim().toUpperCase() || "NG";

  if (description.length < 3) {
    return {
      status: "error",
      message: "Enter a short product description first.",
    };
  }

  try {
    const suggestions = await suggestHsCodes(description, destination);
    if (suggestions.length === 0) {
      return {
        status: "error",
        message: "No suggestions found. Try a more specific description.",
      };
    }
    return { status: "success", suggestions };
  } catch {
    return {
      status: "error",
      message: "The AI assistant is unavailable right now. Please try again.",
    };
  }
}

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

  const plan = await getEffectivePlan(organization.id, organization.plan);
  const entitlement = await getEntitlement(organization.id, plan);
  if (!entitlement.canCreateShipment) {
    redirect("/dashboard/billing?limit=shipments");
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

  await incrementUsage(organization.id, "shipment");

  redirect(`/dashboard/shipments/${shipmentId}`);
}

export async function runChecksAction(formData: FormData): Promise<void> {
  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!shipmentId) {
    return;
  }

  const shipment = await getShipmentWithItems(shipmentId);
  if (!shipment) {
    return;
  }

  const findings = runConsistencyChecks(shipment);
  await replaceFindings(shipmentId, findings);

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
  revalidatePath("/dashboard");
}

export async function resolveFindingAction(formData: FormData): Promise<void> {
  const findingId = String(formData.get("findingId") ?? "").trim();
  const resolved = String(formData.get("resolved") ?? "") === "true";
  if (!findingId) {
    return;
  }

  await setFindingResolved(findingId, resolved);

  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (shipmentId) {
    revalidatePath(`/dashboard/shipments/${shipmentId}`);
  }
  revalidatePath("/dashboard");
}
