import type { Metadata } from "next";
import { getAdminOverview } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Overview",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  const stats = [
    { label: "Users", value: overview.userCount },
    { label: "Organizations", value: overview.orgCount },
    { label: "Shipments", value: overview.shipmentCount },
    { label: "Documents", value: overview.documentCount },
    { label: "Active subscriptions", value: overview.activeSubscriptionCount },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Platform
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Platform-wide counts across every organization.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
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

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Recent organizations
          </h2>

          {overview.recentOrganizations.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No organizations yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Plan</th>
                  <th className="py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentOrganizations.map((organization) => (
                  <tr
                    key={`${organization.name}-${organization.createdAt}`}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="py-3 font-medium text-deep-harbor">
                      {organization.name}
                    </td>
                    <td className="py-3 text-ink">{organization.plan}</td>
                    <td className="py-3 font-mono text-xs text-muted">
                      {formatDate(organization.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Recent users
          </h2>

          {overview.recentUsers.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No users yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="py-3 font-medium">Email</th>
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentUsers.map((user) => (
                  <tr
                    key={`${user.email}-${user.createdAt}`}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="py-3 font-medium text-deep-harbor">
                      {user.email || "-"}
                    </td>
                    <td className="py-3 text-ink">{user.fullName ?? "-"}</td>
                    <td className="py-3 font-mono text-xs text-muted">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
