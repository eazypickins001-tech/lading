import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChannelBadge, StatusBadge } from "@/components/shipment-badges";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, formatNumber, titleCase } from "@/lib/documents/pdf";
import { getShipmentWithItems } from "@/lib/shipments";

const documents = [
  { type: "commercial-invoice", label: "Commercial Invoice" },
  { type: "packing-list", label: "Packing List" },
  { type: "proforma-invoice", label: "Proforma Invoice" },
];

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const shipment = await getShipmentWithItems(id);
  if (!shipment) {
    notFound();
  }

  const total = shipment.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_value,
    0,
  );
  const totalQuantity = shipment.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const facts = [
    { label: "Channel", value: titleCase(shipment.channel) },
    { label: "Route", value: `${shipment.origin_country} → ${shipment.destination_country}` },
    { label: "Mode", value: titleCase(shipment.mode) },
    {
      label: "Incoterm",
      value:
        [shipment.incoterm, shipment.incotermName]
          .filter(Boolean)
          .join(" — ") || "Not set",
    },
    { label: "Incoterm place", value: shipment.incoterm_place ?? "Not set" },
    { label: "Currency", value: shipment.currency },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="shipments" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <Link
          href="/dashboard/shipments"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          ← Back to shipments
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-semibold tracking-tight text-deep-harbor">
                {shipment.reference ?? shipment.id.slice(0, 8)}
              </h1>
              <StatusBadge status={shipment.status} />
              <ChannelBadge channel={shipment.channel} />
            </div>
            <p className="mt-2 text-muted">{shipment.organization.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Total value
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-deep-harbor">
              {formatMoney(total, shipment.currency)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Shipment facts
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-medium uppercase tracking-widest text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-hairline bg-white">
          <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Items
            </h2>
            <span className="font-mono text-xs text-muted">
              {shipment.items.length} line
              {shipment.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">HS code</th>
                  <th className="px-6 py-3 text-right font-medium">Qty</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 text-right font-medium">
                    Unit value
                  </th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                  <th className="px-6 py-3 text-right font-medium">Net / Gross</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-4 text-ink">{item.description}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink">
                      {item.hs_code ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.quantity, 3)}
                    </td>
                    <td className="px-6 py-4 text-ink">{item.unit}</td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.unit_value, 2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.quantity * item.unit_value, 2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-muted">
                      {item.net_weight_kg === null
                        ? "—"
                        : formatNumber(item.net_weight_kg, 3)}{" "}
                      /{" "}
                      {item.gross_weight_kg === null
                        ? "—"
                        : formatNumber(item.gross_weight_kg, 3)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cloud">
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-sm font-medium text-ink"
                  >
                    Totals
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-medium text-ink">
                    {formatNumber(totalQuantity, 3)}
                  </td>
                  <td />
                  <td />
                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-deep-harbor">
                    {formatMoney(total, shipment.currency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Documents
          </h2>
          <p className="mt-2 text-sm text-muted">
            Generate a document from this shipment record. It opens in a new
            tab and is logged against the shipment.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {documents.map((document) => (
              <a
                key={document.type}
                href={`/api/shipments/${shipment.id}/documents/${document.type}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
              >
                {document.label}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
