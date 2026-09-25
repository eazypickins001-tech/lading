"use client";

import { useActionState } from "react";
import { screenNameAction, type ScreenNameState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";

function scoreTone(score: number): string {
  if (score >= 0.85) {
    return "text-danger";
  }
  if (score >= 0.6) {
    return "text-warning";
  }
  return "text-muted";
}

export function ScreeningForm() {
  const [state, action, pending] = useActionState<ScreenNameState, FormData>(
    screenNameAction,
    undefined,
  );

  return (
    <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
        Screen a name
      </h2>
      <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block text-sm font-medium text-ink">
          Name
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Bank of Dabolim"
            className={`${inputClass} w-80`}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
        >
          {pending ? "Screening..." : "Screen"}
        </button>
      </form>

      {state?.status === "error" ? (
        <p className="mt-5 text-sm text-danger">{state.message}</p>
      ) : null}

      {state?.status === "success" && state.matches.length === 0 ? (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/10 p-6 text-center">
          <p className="text-sm font-medium text-success">
            No matches for &quot;{state.query}&quot;.
          </p>
          <p className="mt-1 text-xs text-muted">
            No restricted party on the consolidated screening list closely
            matches this name.
          </p>
        </div>
      ) : null}

      {state?.status === "success" && state.matches.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-hairline">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-5 py-3 font-medium">Matched name</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {state.matches.map((match) => (
                <tr
                  key={match.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-deep-harbor">
                    {match.name}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    {match.source ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-ink">
                    {match.entity_type ?? "-"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {match.country ?? "-"}
                  </td>
                  <td
                    className={`px-5 py-4 text-right font-mono text-xs ${scoreTone(
                      match.score,
                    )}`}
                  >
                    {match.score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
