import {
  resolveFindingAction,
  runChecksAction,
} from "@/app/dashboard/shipments/actions";
import type { FindingSeverity } from "@/lib/consistency";
import type { StoredFinding } from "@/lib/consistency-store";

const severityOrder: FindingSeverity[] = ["critical", "error", "warning", "info"];

const severityStyles: Record<FindingSeverity, string> = {
  critical: "bg-danger/10 text-danger",
  error: "bg-danger/10 text-danger",
  warning: "bg-warning/15 text-ink",
  info: "bg-cloud text-muted border border-hairline",
};

const severityLabels: Record<FindingSeverity, string> = {
  critical: "Critical",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyles[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  );
}

function FindingRow({
  shipmentId,
  finding,
}: {
  shipmentId: string;
  finding: StoredFinding;
}) {
  return (
    <li
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-5 py-4 last:border-0 ${
        finding.resolved ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-1 items-start gap-3">
        <SeverityBadge severity={finding.severity} />
        <p
          className={`text-sm ${
            finding.resolved ? "text-muted line-through" : "text-ink"
          }`}
        >
          {finding.message}
        </p>
      </div>
      <form action={resolveFindingAction}>
        <input type="hidden" name="findingId" value={finding.id} />
        <input type="hidden" name="shipmentId" value={shipmentId} />
        <input
          type="hidden"
          name="resolved"
          value={finding.resolved ? "false" : "true"}
        />
        <button
          type="submit"
          className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
        >
          {finding.resolved ? "Reopen" : "Mark resolved"}
        </button>
      </form>
    </li>
  );
}

export function ConsistencyFindings({
  shipmentId,
  findings,
}: {
  shipmentId: string;
  findings: StoredFinding[];
}) {
  const open = findings.filter((finding) => !finding.resolved);
  const resolved = findings.filter((finding) => finding.resolved);
  const counts = severityOrder
    .map((severity) => ({
      severity,
      count: open.filter((finding) => finding.severity === severity).length,
    }))
    .filter((entry) => entry.count > 0);

  return (
    <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Consistency checks
          </h2>
          <p className="mt-2 text-sm text-muted">
            Deterministic cross-checks across the shipment fields and line
            items.
          </p>
        </div>
        <form action={runChecksAction}>
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <button
            type="submit"
            className="rounded-md bg-signal-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Run checks
          </button>
        </form>
      </div>

      {findings.length === 0 ? (
        <div className="mt-5 rounded-lg border border-success/30 bg-success/5 px-5 py-6 text-center">
          <p className="text-sm font-medium text-success">
            No consistency issues found.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {counts.map((entry) => (
              <span
                key={entry.severity}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${severityStyles[entry.severity]}`}
              >
                {severityLabels[entry.severity]}
                <span className="font-mono">{entry.count}</span>
              </span>
            ))}
            {counts.length === 0 ? (
              <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                All findings resolved
              </span>
            ) : null}
          </div>

          {open.length > 0 ? (
            <ul className="mt-5 overflow-hidden rounded-lg border border-hairline">
              {open.map((finding) => (
                <FindingRow
                  key={finding.id}
                  shipmentId={shipmentId}
                  finding={finding}
                />
              ))}
            </ul>
          ) : null}

          {resolved.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Resolved
              </h3>
              <ul className="mt-3 overflow-hidden rounded-lg border border-hairline">
                {resolved.map((finding) => (
                  <FindingRow
                    key={finding.id}
                    shipmentId={shipmentId}
                    finding={finding}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
