import { PDFDocument } from "pdf-lib";
import { DOCUMENT_GENERATORS } from "./registry";
import type { ShipmentDocumentPayload } from "./types";

export const STANDARD_DOCUMENT_SET = [
  "commercial-invoice",
  "packing-list",
  "bill-of-lading",
];

export function resolveDocumentSet(
  includeCertificateOfOrigin: boolean,
): string[] {
  const slugs = [...STANDARD_DOCUMENT_SET];
  if (includeCertificateOfOrigin) {
    slugs.push("certificate-of-origin");
  }
  return slugs;
}

export async function generateDocumentSet(
  slugs: string[],
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const slug of slugs) {
    const definition = DOCUMENT_GENERATORS[slug];
    if (!definition) {
      continue;
    }
    const bytes = await definition.generate(payload);
    const source = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }
  return merged.save();
}
