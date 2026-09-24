import Link from "next/link";
import { redirect } from "next/navigation";
import { ChannelBadge, StatusBadge } from "@/components/shipment-badges";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { titleCase } from "@/lib/documents/pdf";
import { listShipments } from "@/lib/shipments";

export default async function ShipmentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const shipments = await listShipments();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="shipments" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {organization.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Shipments
            </h1>
            <p className="mt-2 text-muted">
              Capture a shipment once and generate its full document set.
            </p>
          </div>
          <Link
            href="/dashboard/shipments/new"
            className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            New shipment
          </Link>
        </div>

        {shipments.length === 0 ? (
          <div className="mt-10 rounded-xl border border-hairline bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-deep-harbor">
              No shipments yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Start with a shipment record. Lading turns it into a commercial
              invoice, packing list, proforma, and more.
            </p>
            <Link
              href="/dashboard/shipments/new"
              className="mt-6 inline-flex rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
            >
              Create your first shipment
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-hairline bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Channel</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Items</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="border-b border-hairline last:border-0 hover:bg-cloud"
                  >
                    <td className="px-5 py-4">
                      <a
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="font-mono text-sm text-deep-harbor hover:text-signal-teal"
                      >
                        {shipment.reference ?? shipment.id.slice(0, 8)}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <ChannelBadge channel={shipment.channel} />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink">
                      {shipment.origin_country} → {shipment.destination_country}
                    </td>
                    <td className="px-5 py-4 text-ink">
                      {titleCase(shipment.mode)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-ink">
                      {shipment.itemCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
