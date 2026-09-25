import { recordAuditEvent } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement, getOrgPlan, incrementUsage } from "@/lib/billing";
import { DOCUMENT_GENERATORS } from "@/lib/documents/registry";
import {
  generateDocumentSet,
  resolveDocumentSet,
} from "@/lib/documents/set";
import { createNotification } from "@/lib/notifications";
import { allowRequest } from "@/lib/rate-limit";
import { getShipmentRequirements } from "@/lib/requirements";
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
  { params }: { params: Promise<{ id: string }> },
) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "none"
  ) {
    return new Response("Forbidden.", { status: 403 });
  }

  const { id } = await params;

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

  const requirements = await getShipmentRequirements(shipment);
  const includeCertificateOfOrigin = requirements.some(
    (document) =>
      document.docType === "certificate_of_origin" && document.required,
  );
  const slugs = resolveDocumentSet(includeCertificateOfOrigin);

  const branding = await getOrgBranding(shipment.org_id);
  const payload = { ...toDocumentPayload(shipment), branding };
  const bytes = await generateDocumentSet(slugs, payload);

  for (const slug of slugs) {
    const definition = DOCUMENT_GENERATORS[slug];
    if (!definition) {
      continue;
    }
    await recordDocumentGenerated(id, definition.docType, {
      type: slug,
      generatedAt: new Date().toISOString(),
      set: true,
    });
    await incrementUsage(shipment.org_id, "document");
  }

  await recordAuditEvent({
    orgId: shipment.org_id,
    userId: user.id,
    action: "document.download_set",
    entityType: "shipment",
    entityId: id,
    metadata: { slugs },
  });

  await createNotification({
    orgId: shipment.org_id,
    userId: user.id,
    title: "Document set generated",
    body: `${slugs.length} documents were generated for ${shipment.reference ?? id.slice(0, 8)}.`,
    link: `/dashboard/shipments/${id}`,
  });

  const reference = (shipment.reference ?? shipment.id.slice(0, 8))
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 60);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reference}-documents.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
