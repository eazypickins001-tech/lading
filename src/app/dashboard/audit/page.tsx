import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type AuditRow = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  created_at: string;
};

type ProfileRow = { id: string; email: string | null };

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_events")
    .select("id, action, entity_type, entity_id, user_id, created_at")
    .eq("org_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data as AuditRow[] | null) ?? [];

  const userIds = [
    ...new Set(
      rows
        .map((row) => row.user_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];

  const emails = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    for (const profile of (profiles as ProfileRow[] | null) ?? []) {
      emails.set(profile.id, profile.email ?? "");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="audit" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Audit trail
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          The most recent {rows.length} events recorded for{" "}
          {organization.name}.
        </p>

        <section className="mt-10 overflow-hidden rounded-xl border border-hairline bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Entity</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-muted"
                    >
                      No audit events yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-ink">
                        {row.action}
                      </td>
                      <td className="px-6 py-3 text-ink">
                        {row.entity_type ?? "-"}
                        {row.entity_id ? (
                          <span className="ml-2 font-mono text-xs text-muted">
                            {row.entity_id.slice(0, 8)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-3 text-ink">
                        {row.user_id
                          ? (emails.get(row.user_id) || row.user_id.slice(0, 8))
                          : "System"}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted">
                        {new Date(row.created_at)
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
