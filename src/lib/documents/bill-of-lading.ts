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

export async function generateBillOfLading(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("Bill of Lading");

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.notice(
    "Ocean bill of lading data sheet - not a negotiable transport document until issued and signed by the carrier.",
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
    {
      title: "Notify Party",
      lines: partyLines(payload.notify, "Same as consignee", null),
    },
  ]);

  layout.heading("Vessel and voyage");
  const routing: KeyValue[] = [
    { label: "Vessel name", value: "To be advised" },
    { label: "Voyage number", value: "To be advised" },
    { label: "Port of loading", value: payload.originCountry },
    { label: "Port of discharge", value: payload.destinationCountry },
    { label: "Place of receipt", value: "To be advised" },
    {
      label: "Place of delivery",
      value: payload.incotermPlace ?? "To be advised",
    },
  ];
  layout.keyValueSection(routing);

  layout.heading("Cargo");
  const columns: TableColumn[] = [
    { key: "marks", label: "Marks and numbers", width: 1.8 },
    { key: "description", label: "Description of goods", width: 3.4 },
    { key: "packages", label: "Packages", width: 1, align: "right" },
    { key: "gross", label: "Gross (kg)", width: 1.3, align: "right" },
    { key: "measurement", label: "Measurement", width: 1.3, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item, index) => ({
    marks: `M${index + 1}`,
    description: item.description,
    packages: formatNumber(item.quantity, 3),
    gross:
      item.grossWeightKg === null ? "-" : formatNumber(item.grossWeightKg, 3),
    measurement: "To be advised",
  }));
  layout.table(columns, rows);

  const totalPackages = payload.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalGross = payload.items.reduce(
    (sum, item) => sum + (item.grossWeightKg ?? 0),
    0,
  );
  layout.totals([
    { label: "Total packages", value: formatNumber(totalPackages, 3) },
    { label: "Total gross weight (kg)", value: formatNumber(totalGross, 3) },
  ]);

  layout.heading("Freight and originals");
  layout.keyValueSection([
    {
      label: "Freight terms",
      value: payload.incoterm ? `As per ${payload.incoterm}` : "To be advised",
    },
    { label: "Number of original BLs", value: "Three (3)" },
    { label: "Place of issue", value: "To be advised" },
    { label: "Date of issue", value: "To be advised" },
  ]);

  layout.heading("Signature");
  layout.keyValueSection([
    { label: "Shipped on board", value: BLANK },
    { label: "Signed for the carrier", value: BLANK },
    { label: "Name and title", value: BLANK },
  ]);

  return layout.save();
}
