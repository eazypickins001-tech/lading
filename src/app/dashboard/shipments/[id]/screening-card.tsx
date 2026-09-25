"use client";

import { useActionState } from "react";
import type { ScreeningResult } from "@/lib/screening";
import { screenShipmentPartiesAction, type ScreenPartiesState } from "../actions";

function scoreTone(score: number | null): string {
  if (score === null) {
    return "text-muted";
  }
  if (score >= 0.85) {
    return "text-danger";
  }
  if (score >= 0.6) {
    return "text-warning";
  }
  return "text-muted";
}

export function ScreeningCard({
  shipmentId,
  initialResults,
}: {
  shipmentId: string;
  initialResults: ScreeningResult[];
}) {
  const [state, action, pending] = useActionState<ScreenPartiesState, FormData>(
    screenShipmentPartiesAction,
    undefined,
  );
  const results = state?.results ?? initialResults;
  const ran = state?.status === "success";

  return (
    <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Screening
          </h2>
          <p className="mt-2 text-sm text-muted">
            Screen the exporter, consignee and notify party against the US
            Consolidated Screening List.
          </p>
        </div>
        <form action={action}>
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal disabled:opacity-60"
          >
            {pending ? "Screening..." : "Screen parties"}
          </button>
        </form>
      </div>

      {state?.status === "error" ? (
        <p className="mt-5 text-sm text-danger">{state.message}</p>
      ) : null}

      {ran && results.length === 0 ? (
        <div className="mt-5 rounded-lg border border-success/30 bg-success/10 p-5 text-sm text-success">
          All clear. No restricted party matches were found for these parties.
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-5 divide-y divide-hairline">
          {results.map((result) => (
            <li
              key={result.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {result.matched_name ?? "-"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {result.party_type ?? "party"}: {result.party_name ?? "-"}
                  {result.source ? ` · ${result.source}` : ""}
                </p>
              </div>
              <span className={`font-mono text-xs ${scoreTone(result.score)}`}>
                {result.score === null ? "-" : result.score.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
