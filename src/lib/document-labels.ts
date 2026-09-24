import type { DocType } from "@/lib/documents/types";

export const docTypeLabels: Record<DocType, string> = {
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  proforma_invoice: "Proforma Invoice",
  certificate_of_origin: "Certificate of Origin",
  bill_of_lading: "Bill of Lading",
  airway_bill: "Air Waybill",
  form_m: "Form M",
  paar: "Pre-Arrival Assessment Report",
  soncap: "SONCAP Certificate",
  nafdac_permit: "NAFDAC Permit",
  nepc_certificate: "NEPC Certificate",
  phytosanitary: "Phytosanitary Certificate",
  insurance_certificate: "Insurance Certificate",
  other: "Other Document",
};

export function docTypeLabel(docType: DocType): string {
  return docTypeLabels[docType];
}
