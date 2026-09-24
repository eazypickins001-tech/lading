import type { Metadata } from "next";
import { listAdminSubscriptions } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Subscriptions",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "border-success/30 bg-success/10 text-success"
      : status === "trialing"
        ? "border-signal-teal/30 bg-signal-teal/10 text-signal-teal"
        : status === "past_due"
          ? "border-warning/30 bg-warning/10 text-warning"
          : status === "cancelled" || status === "expired"
            ? "border-danger/30 bg-danger/10 text-danger"
            : "border-hairline bg-cloud text-muted";

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${tone}`}
    >
      {status}
    </span>
  );
}

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listAdminSubscriptions();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Platform
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Subscriptions
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Billing records across every organization.
      </p>

      {subscriptions.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-white p-10 text-center text-sm text-muted">
          No subscriptions found.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-hairline bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-5 py-3 font-medium">Organization</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Period end</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="border-b border-hairline last:border-0 hover:bg-cloud"
                >
                  <td className="px-5 py-4 font-medium text-deep-harbor">
                    {subscription.orgName}
                  </td>
                  <td className="px-5 py-4 text-ink">{subscription.plan}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={subscription.status} />
                  </td>
                  <td className="px-5 py-4 text-ink">
                    {subscription.provider ?? "-"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {subscription.periodEnd
                      ? formatDate(subscription.periodEnd)
                      : "-"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDate(subscription.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
