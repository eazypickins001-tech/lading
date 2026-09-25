import { DOCUMENT_GENERATORS } from "@/lib/documents/registry";
import { recordAuditEvent } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement, getOrgPlan, incrementUsage } from "@/lib/billing";
import { createNotification } from "@/lib/notifications";
import { allowRequest } from "@/lib/rate-limit";
import {
  getShipmentWithItems,
  recordDocumentGenerated,
  toDocumentPayload,
} from "@/lib/shipments";
import { getOrgBranding } from "@/lib/storage";
import { getEffectivePlan } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "none"
  ) {
    return new Response("Forbidden.", { status: 403 });
  }

  const { id, type } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const allowed = await allowRequest(`doc:${user.id}`, 120, 3600);
  if (!allowed) {
    return new Response("Too many requests.", { status: 429 });
  }

  const shipment = await getShipmentWithItems(id);
  if (!shipment) {
    return new Response("Shipment not found.", { status: 404 });
  }

  const generator = DOCUMENT_GENERATORS[type];
  if (!generator) {
    return new Response("Unsupported document type.", { status: 400 });
  }

  const plan = await getEffectivePlan(
    shipment.org_id,
    await getOrgPlan(shipment.org_id),
  );
  const entitlement = await getEntitlement(shipment.org_id, plan);
  if (!entitlement.canCreateDocument) {
    return Response.json(
      { error: "Document limit reached for your plan." },
      { status: 402 },
    );
  }

  const branding = await getOrgBranding(shipment.org_id);
  const payload = { ...toDocumentPayload(shipment), branding };
  const bytes = await generator.generate(payload);

  await recordDocumentGenerated(id, generator.docType, {
    type,
    generatedAt: new Date().toISOString(),
  });

  await incrementUsage(shipment.org_id, "document");

  await recordAuditEvent({
    orgId: shipment.org_id,
    userId: user.id,
    action: "document.download",
    entityType: "shipment",
    entityId: id,
    metadata: { type },
  });

  await createNotification({
    orgId: shipment.org_id,
    userId: user.id,
    title: "Document generated",
    body: `${type} was generated for ${shipment.reference ?? id.slice(0, 8)}.`,
    link: `/dashboard/shipments/${id}`,
  });

  const reference = (shipment.reference ?? shipment.id.slice(0, 8))
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 60);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${reference}-${type}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
