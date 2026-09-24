import { generateInvoiceDocument } from "./invoice";
import type { ShipmentDocumentPayload } from "./types";

export async function generateProformaInvoice(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  return generateInvoiceDocument(payload, {
    title: "Proforma Invoice",
    proforma: true,
  });
}
