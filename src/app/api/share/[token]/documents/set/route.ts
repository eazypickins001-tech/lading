import { recordAuditEvent } from "@/lib/audit";
import {
  generateDocumentSet,
  resolveDocumentSet,
} from "@/lib/documents/set";
import { getShipmentRequirements } from "@/lib/requirements";
import { getShareLinkByToken } from "@/lib/share-links";
import { getShipmentWithItems, toDocumentPayload } from "@/lib/shipments";
import { getOrgBranding } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const admin = createAdminClient();

  const link = await getShareLinkByToken(token, admin);
  if (!link) {
    return new Response("This share link was not found.", { status: 404 });
  }

  if (new Date(link.expiresAt).getTime() <= Date.now()) {
    return new Response("This share link has expired.", { status: 410 });
  }

  const shipment = await getShipmentWithItems(link.shipmentId, admin);
  if (!shipment) {
    return new Response("The shared shipment was not found.", { status: 404 });
  }

  const requirements = await getShipmentRequirements(shipment, admin);
  const includeCertificateOfOrigin = requirements.some(
    (document) =>
      document.docType === "certificate_of_origin" && document.required,
  );
  const slugs = resolveDocumentSet(includeCertificateOfOrigin);

  const branding = await getOrgBranding(shipment.org_id, admin);
  const payload = { ...toDocumentPayload(shipment), branding };
  const bytes = await generateDocumentSet(slugs, payload);

  await recordAuditEvent(
    {
      orgId: shipment.org_id,
      userId: null,
      action: "share.download",
      entityType: "shipment",
      entityId: shipment.id,
      metadata: { token, slugs },
    },
    admin,
  );

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
