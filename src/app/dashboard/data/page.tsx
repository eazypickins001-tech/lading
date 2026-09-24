import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { InfoTip } from "@/components/info-tip";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  approveChangeAction,
  rejectChangeAction,
  runAllSyncAction,
  runSourceSyncAction,
  syncPaystackPlansAction,
} from "./actions";

type DataSourceRow = {
  id: string;
  name: string;
  category: string;
  cadence: string;
  access_method: string;
  status: string;
  last_checked_at: string | null;
  content_hash: string | null;
};

type SnapshotRow = {
  id: string;
  source_id: string;
  fetched_at: string;
  diff_summary: string | null;
};

type ParsedFxItem = {
  currency: string;
  rateNgn: number;
};

type ParsedValue = {
  kind: "fx";
  items: ParsedFxItem[];
};

type StagedChangeRow = {
  id: string;
  source_id: string;
  entity_type: string;
  entity_key: string;
  new_value: { excerpt?: string; parsed?: ParsedValue } | null;
  detected_at: string;
  data_sources: { name: string } | { name: string }[] | null;
};

function first<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }
  return value.slice(0, 16).replace("T", " ");
}

function shortHash(value: string | null): string {
  return value ? value.slice(0, 8) : "-";
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ok"
      ? "border-success/30 bg-success/10 text-success"
      : status === "degraded"
        ? "border-warning/30 bg-warning/10 text-warning"
        : status === "broken"
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

export default async function DataSourcesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: sourceData } = await supabase
    .from("data_sources")
    .select(
      "id, name, category, cadence, access_method, status, last_checked_at, content_hash",
    )
    .order("name", { ascending: true });

  const sources = (sourceData ?? []) as DataSourceRow[];
  const sourceIds = sources.map((source) => source.id);

  const [changeResult, snapshotResult] = await Promise.all([
    supabase
      .from("staged_changes")
      .select(
        "id, source_id, entity_type, entity_key, new_value, detected_at, data_sources(name)",
      )
      .eq("status", "pending")
      .order("detected_at", { ascending: false }),
    sourceIds.length > 0
      ? supabase
          .from("source_snapshots")
          .select("id, source_id, fetched_at, diff_summary")
          .in("source_id", sourceIds)
          .order("fetched_at", { ascending: false })
      : Promise.resolve({ data: [] as SnapshotRow[] }),
  ]);

  const changes = (changeResult.data ?? []) as StagedChangeRow[];

  const latestSnapshot = new Map<string, SnapshotRow>();
  for (const snapshot of (snapshotResult.data ?? []) as SnapshotRow[]) {
    if (!latestSnapshot.has(snapshot.source_id)) {
      latestSnapshot.set(snapshot.source_id, snapshot);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="dashboard" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Data sources
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Monitor external trade data sources and review detected changes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <form action={syncPaystackPlansAction}>
                <button
                  type="submit"
                  className="rounded-md border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:bg-cloud"
                >
                  Sync Paystack plans
                </button>
              </form>
              <InfoTip label="About syncing Paystack plans">
                Creates or updates the monthly Paystack plans for paid tiers.
              </InfoTip>
            </div>
            <form action={runAllSyncAction}>
              <button
                type="submit"
                className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
              >
                Run all due
              </button>
            </form>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Sources
          </h2>

          {sources.length === 0 ? (
            <div className="mt-6 rounded-xl border border-hairline bg-white p-10 text-center text-sm text-muted">
              No data sources configured.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-hairline bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Cadence</th>
                    <th className="px-5 py-3 font-medium">Access</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Last checked</th>
                    <th className="px-5 py-3 font-medium">Hash</th>
                    <th className="px-5 py-3 font-medium">Last snapshot</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => {
                    const snapshot = latestSnapshot.get(source.id);
                    return (
                      <tr
                        key={source.id}
                        className="border-b border-hairline last:border-0 hover:bg-cloud"
                      >
                        <td className="px-5 py-4 font-medium text-deep-harbor">
                          {source.name}
                        </td>
                        <td className="px-5 py-4 text-ink">{source.category}</td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {source.cadence}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {source.access_method}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={source.status} />
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {formatDateTime(source.last_checked_at)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {shortHash(source.content_hash)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {snapshot ? formatDateTime(snapshot.fetched_at) : "-"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <form action={runSourceSyncAction}>
                            <input
                              type="hidden"
                              name="sourceId"
                              value={source.id}
                            />
                            <button
                              type="submit"
                              className="rounded-md border border-hairline px-4 py-2 text-xs font-medium text-ink hover:bg-cloud"
                            >
                              Run now
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Pending changes
            </h2>
            <InfoTip label="About pending changes">
              Detected changes are staged for human review. They are never
              published automatically.
            </InfoTip>
          </div>

          {changes.length === 0 ? (
            <div className="mt-6 rounded-xl border border-hairline bg-white p-10 text-center">
              <p className="text-sm text-muted">
                No changes are awaiting review.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {changes.map((change) => {
                const source = first(change.data_sources);
                return (
                  <div
                    key={change.id}
                    className="rounded-xl border border-hairline bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-deep-harbor">
                          {source?.name ?? change.entity_key}
                        </p>
                        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                          {change.entity_type} · detected{" "}
                          {formatDateTime(change.detected_at)}
                        </p>
                        {change.new_value?.excerpt ? (
                          <p className="mt-3 max-w-3xl text-sm text-ink">
                            {change.new_value.excerpt}
                          </p>
                        ) : null}
                        {change.new_value?.parsed?.items?.length ? (
                          <div className="mt-3">
                            <p className="font-mono text-xs uppercase tracking-widest text-muted">
                              {change.new_value.parsed.items.length} rates parsed
                            </p>
                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink">
                              {change.new_value.parsed.items.map((item) => (
                                <li key={item.currency}>
                                  {item.currency}{" "}
                                  {item.rateNgn.toLocaleString("en-NG", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-3">
                        <form action={approveChangeAction}>
                          <input
                            type="hidden"
                            name="changeId"
                            value={change.id}
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-signal-teal px-4 py-2 text-xs font-medium text-white hover:bg-signal-teal/90"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={rejectChangeAction}>
                          <input
                            type="hidden"
                            name="changeId"
                            value={change.id}
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-danger/30 px-4 py-2 text-xs font-medium text-danger hover:bg-danger/5"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
