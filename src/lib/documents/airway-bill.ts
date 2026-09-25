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

export async function generateAirWaybill(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("Air Waybill", payload.branding);

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.notice(
    "Air waybill data sheet - not valid for carriage until issued and signed by the carrier.",
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

  layout.heading("Routing");
  const routing: KeyValue[] = [
    { label: "Airport of departure", value: payload.originCountry },
    { label: "Airport of destination", value: payload.destinationCountry },
    { label: "Carrier", value: "To be advised" },
    { label: "Flight number", value: "To be advised" },
    { label: "Date of departure", value: "To be advised" },
    {
      label: "Incoterm",
      value:
        [payload.incoterm, payload.incotermName].filter(Boolean).join(" - ") ||
        "To be advised",
    },
  ];
  layout.keyValueSection(routing);

  layout.heading("Cargo");
  const columns: TableColumn[] = [
    { key: "pieces", label: "Pieces", width: 1, align: "right" },
    { key: "description", label: "Description of goods", width: 3.6 },
    { key: "gross", label: "Gross (kg)", width: 1.3, align: "right" },
    { key: "chargeable", label: "Chargeable (kg)", width: 1.4, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item) => ({
    pieces: formatNumber(item.quantity, 3),
    description: item.description,
    gross:
      item.grossWeightKg === null ? "-" : formatNumber(item.grossWeightKg, 3),
    chargeable: "To be advised",
  }));
  layout.table(columns, rows);

  const totalPieces = payload.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalGross = payload.items.reduce(
    (sum, item) => sum + (item.grossWeightKg ?? 0),
    0,
  );
  layout.totals([
    { label: "Total pieces", value: formatNumber(totalPieces, 3) },
    { label: "Total gross weight (kg)", value: formatNumber(totalGross, 3) },
  ]);

  layout.heading("Values and charges");
  layout.keyValueSection([
    { label: "Declared value for carriage", value: "To be advised" },
    { label: "Declared value for customs", value: "To be advised" },
    { label: "Currency", value: payload.currency },
    { label: "Freight terms", value: "To be advised" },
  ]);

  layout.heading("Signature");
  layout.keyValueSection([
    { label: "Executed on", value: BLANK },
    { label: "At place", value: BLANK },
    { label: "Signed for the carrier", value: BLANK },
  ]);

  return layout.save();
}
