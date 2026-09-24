import { generateCommercialInvoice } from "@/lib/documents/invoice";
import { generatePackingList } from "@/lib/documents/packing-list";
import { generateProformaInvoice } from "@/lib/documents/proforma";
import type { DocType, ShipmentDocumentPayload } from "@/lib/documents/types";
import { getEntitlement, getOrgPlan, incrementUsage } from "@/lib/billing";
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
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const { id, type } = await params;

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

  const reference = shipment.reference ?? shipment.id.slice(0, 8);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${reference}-${type}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
