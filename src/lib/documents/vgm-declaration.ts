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

export async function generateVgmDeclaration(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  const layout = await PdfLayout.create("VGM Declaration", payload.branding);

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  layout.notice(
    "Verified Gross Mass declaration under SOLAS Chapter VI, Regulation 2. The shipper is responsible for the accuracy of the declared mass.",
  );

  layout.heading("Shipper");
  layout.partySection([
    {
      title: "Shipper",
      lines: partyLines(
        payload.exporter,
        payload.organization.name,
        payload.organization.country,
      ),
    },
  ]);

  layout.heading("Container and vessel");
  const container: KeyValue[] = [
    { label: "Container number", value: "To be advised" },
    { label: "Seal number", value: "To be advised" },
    { label: "Vessel name", value: "To be advised" },
    { label: "Voyage number", value: "To be advised" },
    { label: "Port of loading", value: payload.originCountry },
    { label: "Port of discharge", value: payload.destinationCountry },
  ];
  layout.keyValueSection(container);

  layout.heading("Verification method");
  layout.keyValueSection([
    { label: "Method 1 (weighed)", value: BLANK },
    { label: "Method 2 (calculated)", value: BLANK },
    { label: "Weighing equipment", value: "To be advised" },
  ]);

  layout.heading("Mass calculation");
  const columns: TableColumn[] = [
    { key: "component", label: "Component", width: 3 },
    { key: "basis", label: "Basis", width: 2 },
    { key: "mass", label: "Mass (kg)", width: 1.4, align: "right" },
  ];
  const rows: TableRow[] = [
    { component: "Cargo and contents", basis: "Net weight", mass: "-" },
    { component: "Packaging and dunnage", basis: "Tare weight", mass: "-" },
    { component: "Container tare", basis: "Tare weight", mass: "-" },
  ];
  layout.table(columns, rows);

  const totalGross = payload.items.reduce(
    (sum, item) => sum + (item.grossWeightKg ?? 0),
    0,
  );
  layout.totals([
    {
      label: "Cargo gross weight (kg)",
      value: formatNumber(totalGross, 3),
    },
    { label: "Verified gross mass (kg)", value: "To be advised" },
  ]);

  layout.heading("Declaration and signature");
  layout.keyValueSection([
    { label: "Declared by", value: BLANK },
    { label: "Name and title", value: BLANK },
    { label: "Place and date", value: BLANK },
  ]);

  return layout.save();
}
