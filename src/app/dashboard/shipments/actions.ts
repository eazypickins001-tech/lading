"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/audit";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { getEntitlement, incrementUsage } from "@/lib/billing";
import { runConsistencyChecks } from "@/lib/consistency";
import { replaceFindings, setFindingResolved } from "@/lib/consistency-store";
import type { TradeChannel, TransportMode } from "@/lib/documents/types";
import { suggestHsCodes, type HsSuggestion } from "@/lib/hs-suggest";
import { upsertParty } from "@/lib/parties";
import { allowRequest } from "@/lib/rate-limit";
import { generateDocumentSet } from "@/lib/documents/set";
import { createShipment, getShipmentWithItems, toDocumentPayload, type CreateShipmentItemInput } from "@/lib/shipments";
import {
  createShareLink,
  revokeShareLink,
} from "@/lib/share-links";
import {
  grantShipmentAccess,
  revokeShipmentAccess,
} from "@/lib/shipment-access";
import {
  deleteShipmentFile,
  getOrgBranding,
  uploadShipmentFile,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/subscriptions";

const ACCESS_MANAGER_ROLES = ["owner", "admin", "trader"];

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

  const allowed = await allowRequest(`ai:${user.id}`, 30, 3600);
  if (!allowed) {
    return { status: "error", message: "Too many requests. Please try again later." };
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

function parseItems(
  formData: FormData,
  fieldErrors: Record<string, string>,
): CreateShipmentItemInput[] {
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

  return items;
}

type PartyRole = "exporter" | "consignee" | "notify";

const PARTY_LABELS: Record<PartyRole, string> = {
  exporter: "Exporter name",
  consignee: "Consignee name",
  notify: "Notify party name",
};

function textField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

async function resolveParty(
  formData: FormData,
  role: PartyRole,
  fieldErrors: Record<string, string>,
): Promise<string | null> {
  const mode = textField(formData, `${role}Mode`) || "new";

  if (mode === "existing") {
    return textField(formData, `${role}PartyId`) || null;
  }

  const name = textField(formData, `${role}Name`);
  if (!name) {
    if (role !== "notify") {
      fieldErrors[`${role}Name`] = `${PARTY_LABELS[role]} is required.`;
    }
    return null;
  }

  const party = await upsertParty({
    type: role,
    name,
    address: textField(formData, `${role}Address`) || null,
    country: textField(formData, `${role}Country`) || null,
    contactName: textField(formData, `${role}ContactName`) || null,
    contactEmail: textField(formData, `${role}ContactEmail`) || null,
    contactPhone: textField(formData, `${role}ContactPhone`) || null,
    taxId: textField(formData, `${role}TaxId`) || null,
  });

  return party.id;
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

  const items = parseItems(formData, fieldErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please correct the highlighted fields.", fieldErrors };
  }

  const exporterPartyId = await resolveParty(formData, "exporter", fieldErrors);
  const consigneePartyId = await resolveParty(
    formData,
    "consignee",
    fieldErrors,
  );
  const notifyPartyId = await resolveParty(formData, "notify", fieldErrors);

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
    exporterPartyId,
    consigneePartyId,
    notifyPartyId,
    items,
  });

  await incrementUsage(organization.id, "shipment");

  await recordAuditEvent({
    orgId: organization.id,
    userId: user.id,
    action: "shipment.create",
    entityType: "shipment",
    entityId: shipmentId,
    metadata: { channel, reference },
  });

  redirect(`/dashboard/shipments/${shipmentId}`);
}

export async function updateShipmentAction(
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

  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!shipmentId) {
    return { error: "The shipment could not be found." };
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

  const items = parseItems(formData, fieldErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please correct the highlighted fields.", fieldErrors };
  }

  const exporterPartyId = await resolveParty(formData, "exporter", fieldErrors);
  const consigneePartyId = await resolveParty(
    formData,
    "consignee",
    fieldErrors,
  );
  const notifyPartyId = await resolveParty(formData, "notify", fieldErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please correct the highlighted fields.", fieldErrors };
  }

  const channel = CHANNELS.includes(channelValue as TradeChannel)
    ? (channelValue as TradeChannel)
    : "import";
  const mode = MODES.includes(modeValue as TransportMode)
    ? (modeValue as TransportMode)
    : "sea";

  const supabase = await createClient();
  const update: {
    channel: TradeChannel;
    origin_country: string;
    destination_country: string;
    mode: TransportMode;
    incoterm: string | null;
    incoterm_place: string | null;
    currency: string;
    exporter_party_id: string | null;
    consignee_party_id: string | null;
    notify_party_id: string | null;
    reference?: string;
  } = {
    channel,
    origin_country: originCountry,
    destination_country: destinationCountry,
    mode,
    incoterm,
    incoterm_place: incotermPlace,
    currency,
    exporter_party_id: exporterPartyId,
    consignee_party_id: consigneePartyId,
    notify_party_id: notifyPartyId,
  };

  if (reference) {
    update.reference = reference;
  }

  const { data: updated, error } = await supabase
    .from("shipments")
    .update(update)
    .eq("id", shipmentId)
    .eq("org_id", organization.id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return { error: "We could not update this shipment. Please try again." };
  }

  const { error: deleteError } = await supabase
    .from("shipment_items")
    .delete()
    .eq("shipment_id", shipmentId);

  if (deleteError) {
    return { error: "We could not update the shipment line items." };
  }

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("shipment_items").insert(
      items.map((item) => ({
        shipment_id: shipmentId,
        description: item.description,
        hs_code: item.hsCode,
        quantity: item.quantity,
        unit: item.unit,
        unit_value: item.unitValue,
        currency,
        net_weight_kg: item.netWeightKg,
        gross_weight_kg: item.grossWeightKg,
      })),
    );

    if (itemsError) {
      return { error: "We could not save the shipment line items." };
    }
  }

  revalidatePath("/dashboard/shipments/[id]", "page");
  revalidatePath("/dashboard/shipments");

  await recordAuditEvent({
    orgId: organization.id,
    userId: user.id,
    action: "shipment.update",
    entityType: "shipment",
    entityId: shipmentId,
    metadata: { channel, reference },
  });

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

export async function uploadShipmentFileAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  const file = formData.get("file");
  if (!shipmentId || !(file instanceof File) || file.size === 0) {
    return;
  }

  try {
    await uploadShipmentFile(organization.id, shipmentId, file);
    await recordAuditEvent({
      orgId: organization.id,
      userId: user.id,
      action: "document.upload",
      entityType: "shipment",
      entityId: shipmentId,
      metadata: { fileName: file.name },
    });
  } catch {
    return;
  }

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
}

export async function deleteShipmentFileAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const fileId = String(formData.get("fileId") ?? "").trim();
  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!fileId) {
    return;
  }

  await deleteShipmentFile(fileId);

  if (shipmentId) {
    revalidatePath(`/dashboard/shipments/${shipmentId}`);
  }
}

export async function mergeShipmentDocumentsAction(
  shipmentId: string,
  slugs: string[],
): Promise<Uint8Array> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized.");
  }

  const shipment = await getShipmentWithItems(shipmentId);
  if (!shipment) {
    throw new Error("Shipment not found.");
  }

  const branding = await getOrgBranding(shipment.org_id);
  const payload = { ...toDocumentPayload(shipment), branding };
  return generateDocumentSet(slugs, payload);
}

export async function createShareLinkAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!shipmentId) {
    return;
  }

  const shipment = await getShipmentWithItems(shipmentId);
  if (!shipment || shipment.org_id !== organization.id) {
    return;
  }

  const parsedDays = Number(formData.get("days") ?? "7");
  const days = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 7;

  try {
    const link = await createShareLink(
      shipmentId,
      organization.id,
      user.id,
      days,
    );
    await recordAuditEvent({
      orgId: organization.id,
      userId: user.id,
      action: "share.create",
      entityType: "shipment",
      entityId: shipmentId,
      metadata: { linkId: link.id, days },
    });
  } catch {
    return;
  }

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
}

export async function revokeShareLinkAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const linkId = String(formData.get("linkId") ?? "").trim();
  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!linkId) {
    return;
  }

  await revokeShareLink(linkId);

  if (shipmentId) {
    revalidatePath(`/dashboard/shipments/${shipmentId}`);
  }
}

export async function grantShipmentAccessAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  const orgId = String(formData.get("orgId") ?? "").trim();
  if (!shipmentId || !orgId) {
    return;
  }

  const shipment = await getShipmentWithItems(shipmentId);
  if (!shipment || shipment.org_id !== organization.id) {
    return;
  }
  if (!ACCESS_MANAGER_ROLES.includes(organization.role)) {
    return;
  }

  try {
    await grantShipmentAccess(shipmentId, orgId, user.id);
    await recordAuditEvent({
      orgId: organization.id,
      userId: user.id,
      action: "access.grant",
      entityType: "shipment",
      entityId: shipmentId,
      metadata: { orgId },
    });
  } catch {
    return;
  }

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
}

export async function revokeShipmentAccessAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const accessId = String(formData.get("accessId") ?? "").trim();
  const shipmentId = String(formData.get("shipmentId") ?? "").trim();
  if (!accessId) {
    return;
  }

  const shipment = shipmentId ? await getShipmentWithItems(shipmentId) : null;
  if (shipment && shipment.org_id !== organization.id) {
    return;
  }
  if (!ACCESS_MANAGER_ROLES.includes(organization.role)) {
    return;
  }

  await revokeShipmentAccess(accessId);

  if (shipmentId) {
    revalidatePath(`/dashboard/shipments/${shipmentId}`);
  }
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
