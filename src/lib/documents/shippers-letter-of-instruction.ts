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

const BLANK = "____________________________________________";

export async function generateShippersLetterOfInstruction(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create(
    "Shipper's Letter of Instruction",
    payload.branding,
  );

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.notice(
    "Instructions to the freight forwarder for arranging carriage, customs clearance and documentation.",
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

  layout.heading("Routing");
  const routing: KeyValue[] = [
    { label: "Mode", value: titleCase(payload.mode) },
    { label: "Origin", value: payload.originCountry },
    { label: "Destination", value: payload.destinationCountry },
    {
      label: "Incoterm",
      value:
        [payload.incoterm, payload.incotermName].filter(Boolean).join(" - ") ||
        "To be advised",
    },
    { label: "Incoterm place", value: payload.incotermPlace ?? "To be advised" },
    { label: "Vessel or flight", value: "To be advised" },
    { label: "Port or airport of loading", value: payload.originCountry },
    {
      label: "Port or airport of discharge",
      value: payload.destinationCountry,
    },
  ];
  layout.keyValueSection(routing);

  layout.heading("Goods");
  const columns: TableColumn[] = [
    { key: "description", label: "Description of goods", width: 3.6 },
    { key: "hsCode", label: "HS Code", width: 1.4 },
    { key: "quantity", label: "Quantity", width: 1.3, align: "right" },
    { key: "gross", label: "Gross (kg)", width: 1.3, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item) => ({
    description: item.description,
    hsCode: item.hsCode ?? "-",
    quantity: `${formatNumber(item.quantity, 3)} ${item.unit}`,
    gross:
      item.grossWeightKg === null ? "-" : formatNumber(item.grossWeightKg, 3),
  }));
  layout.table(columns, rows);

  layout.heading("Special instructions");
  layout.keyValueSection([
    { label: "Documentation", value: "To be advised" },
    { label: "Insurance", value: "To be advised" },
    { label: "Handling notes", value: "To be advised" },
  ]);

  layout.heading("Signature");
  layout.keyValueSection([
    { label: "Authorised by", value: BLANK },
    { label: "Name and title", value: BLANK },
    { label: "Date", value: BLANK },
  ]);

  return layout.save();
}
