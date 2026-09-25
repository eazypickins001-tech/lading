import {
  PdfLayout,
  formatMoney,
  formatNumber,
  lineAmount,
  titleCase,
  type KeyValue,
  type TableColumn,
  type TableRow,
} from "./pdf";
import type { DocumentParty, ShipmentDocumentPayload } from "./types";

export function partyLines(
  party: DocumentParty | null,
  fallbackName: string,
  fallbackCountry: string | null,
): string[] {
  if (!party) {
    return [fallbackName, fallbackCountry ?? ""].filter(
      (line) => line.trim().length > 0,
    );
  }
  return [
    party.name,
    party.address ?? "",
    party.country ?? "",
    party.contactName ? `Attn: ${party.contactName}` : "",
    party.contactEmail ?? "",
    party.contactPhone ?? "",
    party.taxId ? `Tax ID: ${party.taxId}` : "",
  ].filter((line) => line.trim().length > 0);
}

function shipmentRows(payload: ShipmentDocumentPayload): KeyValue[] {
  const incoterm =
    [payload.incoterm, payload.incotermName].filter(Boolean).join(" - ") || "-";
  return [
    { label: "Origin", value: payload.originCountry },
    { label: "Destination", value: payload.destinationCountry },
    { label: "Mode", value: titleCase(payload.mode) },
    { label: "Incoterm", value: incoterm },
    { label: "Incoterm place", value: payload.incotermPlace ?? "-" },
    { label: "Currency", value: payload.currency },
  ];
}

export async function generateInvoiceDocument(
  payload: ShipmentDocumentPayload,
  options: { title: string; proforma: boolean },
): Promise<Uint8Array> {
  const layout = await PdfLayout.create(options.title, payload.branding);

  layout.titleBlock([
    { label: "Reference", value: payload.reference ?? "-" },
    { label: "Date", value: payload.createdAt.slice(0, 10) },
    {
      label: "Channel",
      value: payload.channel === "import" ? "Import" : "Export",
    },
  ]);

  if (options.proforma) {
    layout.notice(
      "Not a final invoice - issued for quotation and customs pre-clearance only.",
    );
  }

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
  layout.keyValueSection(shipmentRows(payload));

  layout.heading("Items");
  const columns: TableColumn[] = [
    { key: "description", label: "Description", width: 4 },
    { key: "hsCode", label: "HS Code", width: 1.4 },
    { key: "quantity", label: "Qty", width: 1, align: "right" },
    { key: "unit", label: "Unit", width: 1 },
    { key: "unitValue", label: "Unit Value", width: 1.6, align: "right" },
    { key: "amount", label: "Amount", width: 1.8, align: "right" },
  ];
  const rows: TableRow[] = payload.items.map((item) => ({
    description: item.description,
    hsCode: item.hsCode ?? "-",
    quantity: formatNumber(item.quantity, 3),
    unit: item.unit,
    unitValue: formatNumber(item.unitValue, 2),
    amount: formatNumber(lineAmount(item), 2),
  }));
  layout.table(columns, rows);

  const total = payload.items.reduce(
    (sum, item) => sum + item.quantity * item.unitValue,
    0,
  );
  layout.totals([
    { label: "Subtotal", value: formatMoney(total, payload.currency) },
    { label: "Total", value: formatMoney(total, payload.currency) },
  ]);

  return layout.save();
}

export async function generateCommercialInvoice(
  payload: ShipmentDocumentPayload,
): Promise<Uint8Array> {
  return generateInvoiceDocument(payload, {
    title: "Commercial Invoice",
    proforma: false,
  });
}
