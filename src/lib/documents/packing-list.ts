import {
  PdfLayout,
  formatNumber,
  titleCase,
  type KeyValue,
  type TableColumn,
  type TableRow,
} from "./pdf";
import { partyLines } from "./invoice";
import type { ShipmentDocumentPayload } from "./types";

export async function generatePackingList(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("Packing List");

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
      title: "Seller / Exporter",
      lines: partyLines(
        payload.exporter,
        payload.organization.name,
        payload.organization.country,
      ),
    },
    {
      title: "Buyer / Consignee",
      lines: partyLines(payload.consignee, "To be confirmed", null),
    },
  ]);

  layout.heading("Shipment");
  const incoterm =
    [payload.incoterm, payload.incotermName].filter(Boolean).join(" - ") || "-";
  const facts: KeyValue[] = [
    { label: "Origin", value: payload.originCountry },
    { label: "Destination", value: payload.destinationCountry },
    { label: "Mode", value: titleCase(payload.mode) },
    { label: "Incoterm", value: incoterm },
  ];
  layout.keyValueSection(facts);

  layout.heading("Items");
  const columns: TableColumn[] = [
    { key: "description", label: "Description", width: 4 },
    { key: "hsCode", label: "HS Code", width: 1.4 },
    { key: "quantity", label: "Qty", width: 1, align: "right" },
    { key: "unit", label: "Unit", width: 1 },
    { key: "net", label: "Net (kg)", width: 1.3, align: "right" },
    { key: "gross", label: "Gross (kg)", width: 1.3, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item) => ({
    description: item.description,
    hsCode: item.hsCode ?? "-",
    quantity: formatNumber(item.quantity, 3),
    unit: item.unit,
    net: item.netWeightKg === null ? "-" : formatNumber(item.netWeightKg, 3),
    gross:
      item.grossWeightKg === null ? "-" : formatNumber(item.grossWeightKg, 3),
  }));
  layout.table(columns, rows);

  const totalQuantity = payload.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalNet = payload.items.reduce(
    (sum, item) => sum + (item.netWeightKg ?? 0),
    0,
  );
  const totalGross = payload.items.reduce(
    (sum, item) => sum + (item.grossWeightKg ?? 0),
    0,
  );
  layout.totals([
    { label: "Total quantity", value: formatNumber(totalQuantity, 3) },
    { label: "Total net weight (kg)", value: formatNumber(totalNet, 3) },
    { label: "Total gross weight (kg)", value: formatNumber(totalGross, 3) },
  ]);

  return layout.save();
}
