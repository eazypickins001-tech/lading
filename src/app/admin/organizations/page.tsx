import type { Metadata } from "next";
import { listAdminOrganizations } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Organizations",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function AdminOrganizationsPage() {
  const organizations = await listAdminOrganizations();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Platform
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Organizations
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every workspace on the platform, with member and shipment counts.
      </p>

      {organizations.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-white p-10 text-center text-sm text-muted">
          No organizations found.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-hairline bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 text-right font-medium">Members</th>
                <th className="px-5 py-3 text-right font-medium">Shipments</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr
                  key={organization.id}
                  className="border-b border-hairline last:border-0 hover:bg-cloud"
                >
                  <td className="px-5 py-4 font-medium text-deep-harbor">
                    {organization.name}
                  </td>
                  <td className="px-5 py-4 text-ink">{organization.type}</td>
                  <td className="px-5 py-4 text-ink">{organization.plan}</td>
                  <td className="px-5 py-4 text-right font-mono text-ink">
                    {organization.memberCount}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-ink">
                    {organization.shipmentCount}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDate(organization.createdAt)}
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
