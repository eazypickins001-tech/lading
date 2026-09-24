import type { Metadata } from "next";
import { listAdminUsers } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Users",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateOrDash(value: string | null): string {
  return value ? formatDate(value) : "-";
}

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Platform
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every account on the platform and the organizations it belongs to.
      </p>

      {users.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-white p-10 text-center text-sm text-muted">
          No users found.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-hairline bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Full name</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Organizations</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-hairline last:border-0 hover:bg-cloud"
                >
                  <td className="px-5 py-4 font-medium text-deep-harbor">
                    {user.email || "-"}
                  </td>
                  <td className="px-5 py-4 text-ink">{user.fullName ?? "-"}</td>
                  <td className="px-5 py-4 text-ink">{user.country ?? "-"}</td>
                  <td className="px-5 py-4 text-ink">
                    {user.organizations.length === 0
                      ? "-"
                      : user.organizations
                          .map(
                            (organization) =>
                              `${organization.name} (${organization.role})`,
                          )
                          .join(", ")}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDateOrDash(user.lastSignInAt)}
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
