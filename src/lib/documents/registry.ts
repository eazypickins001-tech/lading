import { generateAirWaybill } from "./airway-bill";
import { generateBillOfLading } from "./bill-of-lading";
import { generateCertificateOfOrigin } from "./certificate-of-origin";
import { generateCommercialInvoice } from "./invoice";
import { generatePackingDeclaration } from "./packing-declaration";
import { generatePackingList } from "./packing-list";
import { generateProformaInvoice } from "./proforma";
import { generateShippersLetterOfInstruction } from "./shippers-letter-of-instruction";
import { generateVgmDeclaration } from "./vgm-declaration";
import type { DocType, ShipmentDocumentPayload } from "./types";

export type DocumentGenerator = (
  payload: ShipmentDocumentPayload,
) => Promise<Uint8Array>;

export type DocumentDefinition = {
  docType: DocType;
  label: string;
  generate: DocumentGenerator;
};

export const DOCUMENT_GENERATORS: Record<string, DocumentDefinition> = {
  "commercial-invoice": {
    docType: "commercial_invoice",
    label: "Commercial Invoice",
    generate: generateCommercialInvoice,
  },
  "packing-list": {
    docType: "packing_list",
    label: "Packing List",
    generate: generatePackingList,
  },
  "proforma-invoice": {
    docType: "proforma_invoice",
    label: "Proforma Invoice",
    generate: generateProformaInvoice,
  },
  "bill-of-lading": {
    docType: "bill_of_lading",
    label: "Bill of Lading",
    generate: generateBillOfLading,
  },
  "airway-bill": {
    docType: "airway_bill",
    label: "Air Waybill",
    generate: generateAirWaybill,
  },
  "certificate-of-origin": {
    docType: "certificate_of_origin",
    label: "Certificate of Origin",
    generate: generateCertificateOfOrigin,
  },
  "shippers-letter-of-instruction": {
    docType: "shippers_letter_of_instruction",
    label: "Shipper's Letter of Instruction",
    generate: generateShippersLetterOfInstruction,
  },
  "vgm-declaration": {
    docType: "vgm_declaration",
    label: "VGM Declaration",
    generate: generateVgmDeclaration,
  },
  "packing-declaration": {
    docType: "packing_declaration",
    label: "Packing Declaration",
    generate: generatePackingDeclaration,
  },
};
