import {
  PdfLayout,
  formatNumber,
  type KeyValue,
  type TableColumn,
  type TableRow,
} from "./pdf";
import { partyLines } from "./invoice";
import type { ShipmentDocumentPayload } from "./types";

const BLANK = "____________________________________________";

export async function generateCertificateOfOrigin(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("Certificate of Origin", payload.branding);

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.heading("Parties");
  layout.partySection([
    {
      title: "Exporter",
      lines: partyLines(
        payload.exporter,
        payload.organization.name,
        payload.organization.country,
      ),
    },
    {
      title: "Consignee",
      lines: partyLines(payload.consignee, "To be confirmed", null),
    },
  ]);

  layout.heading("Origin and invoice");
  const facts: KeyValue[] = [
    { label: "Country of origin", value: payload.originCountry },
    { label: "Country of destination", value: payload.destinationCountry },
    { label: "Invoice number", value: payload.reference ?? "To be advised" },
    { label: "Invoice date", value: payload.createdAt.slice(0, 10) },
  ];
  layout.keyValueSection(facts);

  layout.heading("Goods");
  const columns: TableColumn[] = [
    { key: "marks", label: "Marks and numbers", width: 1.8 },
    { key: "description", label: "Description of goods", width: 3.4 },
    { key: "hsCode", label: "HS Code", width: 1.4 },
    { key: "quantity", label: "Quantity", width: 1.3, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item, index) => ({
    marks: `M${index + 1}`,
    description: item.description,
    hsCode: item.hsCode ?? "-",
    quantity: `${formatNumber(item.quantity, 3)} ${item.unit}`,
  }));
  layout.table(columns, rows);

  layout.notice(
    `The exporter declares that the goods described above originate in ${payload.originCountry} and comply with the rules of origin applicable to the destination market.`,
  );

  layout.heading("Certification");
  layout.keyValueSection([
    { label: "Certified by", value: BLANK },
    { label: "Chamber or authority", value: BLANK },
    { label: "Place and date", value: BLANK },
    { label: "Authorised signature", value: BLANK },
    { label: "Stamp", value: BLANK },
  ]);

  return layout.save();
}
