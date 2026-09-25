import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { formatNumber, titleCase } from "@/lib/documents/pdf";
import type {
  ShipmentStatus,
  TradeChannel,
  TransportMode,
} from "@/lib/documents/types";
import { SHIPMENT_STATUSES, statusLabel } from "@/lib/shipment-status";
import { createClient } from "@/lib/supabase/server";

type ReportItemRow = {
  quantity: number | string;
  unit_value: number | string;
};

type ReportShipmentRow = {
  id: string;
  status: ShipmentStatus;
  channel: TradeChannel;
  mode: TransportMode;
  created_at: string;
  shipment_items: ReportItemRow[] | null;
};

type ReportDocumentRow = {
  id: string;
  created_at: string;
};

type MonthRow = {
  key: string;
  label: string;
  shipments: number;
  documents: number;
};

const MODES: TransportMode[] = [
  "sea",
  "air",
  "road",
  "rail",
  "courier",
  "multimodal",
];

function toNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const [shipmentsResult, documentsResult] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        "id, status, channel, mode, created_at, shipment_items(quantity, unit_value)",
      )
      .eq("org_id", organization.id),
    supabase
      .from("shipment_documents")
      .select("id, created_at, shipments!inner(org_id)")
      .eq("shipments.org_id", organization.id),
  ]);

  const shipments =
    (shipmentsResult.data as ReportShipmentRow[] | null) ?? [];
  const documents =
    (documentsResult.data as ReportDocumentRow[] | null) ?? [];

  const totalValue = shipments.reduce((sum, shipment) => {
    const items = shipment.shipment_items ?? [];
    return (
      sum +
      items.reduce(
        (itemSum, item) =>
          itemSum + toNumber(item.quantity) * toNumber(item.unit_value),
        0,
      )
    );
  }, 0);

  const byStatus = new Map<ShipmentStatus, number>(
    SHIPMENT_STATUSES.map((status) => [status, 0]),
  );
  const byChannel = new Map<TradeChannel, number>([
    ["import", 0],
    ["export", 0],
  ]);
  const byMode = new Map<TransportMode, number>(
    MODES.map((mode) => [mode, 0]),
  );

  for (const shipment of shipments) {
    byStatus.set(shipment.status, (byStatus.get(shipment.status) ?? 0) + 1);
    byChannel.set(shipment.channel, (byChannel.get(shipment.channel) ?? 0) + 1);
    byMode.set(shipment.mode, (byMode.get(shipment.mode) ?? 0) + 1);
  }

  const now = new Date();
  const months: MonthRow[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    months.push({
      key: monthKey(date),
      label: date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      shipments: 0,
      documents: 0,
    });
  }

  const monthIndex = new Map(months.map((month) => [month.key, month]));

  for (const shipment of shipments) {
    const bucket = monthIndex.get(monthKey(new Date(shipment.created_at)));
    if (bucket) {
      bucket.shipments += 1;
    }
  }

  for (const document of documents) {
    const bucket = monthIndex.get(monthKey(new Date(document.created_at)));
    if (bucket) {
      bucket.documents += 1;
    }
  }

  const stats = [
    { label: "Shipments", value: formatNumber(shipments.length, 0) },
    { label: "Documents", value: formatNumber(documents.length, 0) },
    { label: "Total value", value: formatNumber(totalValue, 2) },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="reports" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A snapshot of shipment and document activity across your workspace.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-hairline bg-white p-6"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-deep-harbor">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="overflow-hidden rounded-xl border border-hairline bg-white">
            <div className="border-b border-hairline px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
                By status
              </h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {SHIPMENT_STATUSES.map((status) => (
                  <tr
                    key={status}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-3 text-ink">
                      {statusLabel(status)}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-ink">
                      {byStatus.get(status) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-xl border border-hairline bg-white">
            <div className="border-b border-hairline px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
                By channel
              </h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {(["import", "export"] as TradeChannel[]).map((channel) => (
                  <tr
                    key={channel}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-3 text-ink">{titleCase(channel)}</td>
                    <td className="px-6 py-3 text-right font-mono text-ink">
                      {byChannel.get(channel) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-xl border border-hairline bg-white">
            <div className="border-b border-hairline px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
                By mode
              </h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {MODES.map((mode) => (
                  <tr
                    key={mode}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-3 text-ink">{titleCase(mode)}</td>
                    <td className="px-6 py-3 text-right font-mono text-ink">
                      {byMode.get(mode) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-hairline bg-white">
          <div className="border-b border-hairline px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Last 6 months
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 text-right font-medium">
                    Shipments
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr
                    key={month.key}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-3 text-ink">{month.label}</td>
                    <td className="px-6 py-3 text-right font-mono text-ink">
                      {month.shipments}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-ink">
                      {month.documents}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
