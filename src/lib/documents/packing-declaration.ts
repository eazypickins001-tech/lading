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

export async function generatePackingDeclaration(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("Packing Declaration", payload.branding);

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.notice(
    "Declaration on wood packaging material and packaging treatment for the consignment described below.",
  );

  layout.heading("Parties");
  layout.partySection([
    {
      title: "Shipper",
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

  layout.heading("Packaging declaration");
  const facts: KeyValue[] = [
    { label: "Packing materials", value: "To be advised" },
    { label: "Treatment method", value: "To be advised" },
    { label: "IPPC mark", value: "To be advised" },
    { label: "Treatment certificate", value: "To be advised" },
    { label: "Country of treatment", value: payload.originCountry },
  ];
  layout.keyValueSection(facts);

  layout.heading("Goods");
  const columns: TableColumn[] = [
    { key: "description", label: "Description of goods", width: 3.6 },
    { key: "quantity", label: "Quantity", width: 1.3, align: "right" },
    { key: "gross", label: "Gross (kg)", width: 1.3, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item) => ({
    description: item.description,
    quantity: `${formatNumber(item.quantity, 3)} ${item.unit}`,
    gross:
      item.grossWeightKg === null ? "-" : formatNumber(item.grossWeightKg, 3),
  }));
  layout.table(columns, rows);

  const totalGross = payload.items.reduce(
    (sum, item) => sum + (item.grossWeightKg ?? 0),
    0,
  );
  layout.totals([
    { label: "Total gross weight (kg)", value: formatNumber(totalGross, 3) },
  ]);

  layout.heading("Signature");
  layout.keyValueSection([
    { label: "Declared by", value: BLANK },
    { label: "Name and title", value: BLANK },
    { label: "Place and date", value: BLANK },
  ]);

  return layout.save();
}
