import { generateCommercialInvoice } from "@/lib/documents/invoice";
import { generatePackingList } from "@/lib/documents/packing-list";
import { generateProformaInvoice } from "@/lib/documents/proforma";
import { generateBillOfLading } from "@/lib/documents/bill-of-lading";
import { generateAirWaybill } from "@/lib/documents/airway-bill";
import { generateCertificateOfOrigin } from "@/lib/documents/certificate-of-origin";
import { generateShippersLetterOfInstruction } from "@/lib/documents/shippers-letter-of-instruction";
import { generateVgmDeclaration } from "@/lib/documents/vgm-declaration";
import { generatePackingDeclaration } from "@/lib/documents/packing-declaration";
import type { DocType, ShipmentDocumentPayload } from "@/lib/documents/types";
import { recordAuditEvent } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { getEntitlement, getOrgPlan, incrementUsage } from "@/lib/billing";
import { allowRequest } from "@/lib/rate-limit";
import {
  getShipmentWithItems,
  recordDocumentGenerated,
  toDocumentPayload,
} from "@/lib/shipments";
import { getEffectivePlan } from "@/lib/subscriptions";

export const runtime = "nodejs";

type Generator = (payload: ShipmentDocumentPayload) => Promise<Uint8Array>;

const generators: Record<string, { docType: DocType; generate: Generator }> = {
  "commercial-invoice": {
    docType: "commercial_invoice",
    generate: generateCommercialInvoice,
  },
  "packing-list": {
    docType: "packing_list",
    generate: generatePackingList,
  },
  "proforma-invoice": {
    docType: "proforma_invoice",
    generate: generateProformaInvoice,
  },
  "bill-of-lading": {
    docType: "bill_of_lading",
    generate: generateBillOfLading,
  },
  "airway-bill": {
    docType: "airway_bill",
    generate: generateAirWaybill,
  },
  "certificate-of-origin": {
    docType: "certificate_of_origin",
    generate: generateCertificateOfOrigin,
  },
  "shippers-letter-of-instruction": {
    docType: "shippers_letter_of_instruction",
    generate: generateShippersLetterOfInstruction,
  },
  "vgm-declaration": {
    docType: "vgm_declaration",
    generate: generateVgmDeclaration,
  },
  "packing-declaration": {
    docType: "packing_declaration",
    generate: generatePackingDeclaration,
  },
};

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

  const generator = generators[type];
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

  const payload = toDocumentPayload(shipment);
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
