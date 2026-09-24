"use client";

import { useActionState } from "react";
import { InfoTip } from "@/components/info-tip";
import { suggestHsAction, type HsSuggestState } from "./actions";

const confidenceStyles: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-cloud text-muted",
};

export function HsAssistant() {
  const [state, action, pending] = useActionState<HsSuggestState, FormData>(
    suggestHsAction,
    undefined,
  );

  return (
    <div className="mt-8 rounded-xl border border-hairline bg-white p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          AI HS code assistant
        </h2>
        <InfoTip label="About the HS assistant">
          Describe your product in plain language and the assistant suggests
          candidate Harmonized System codes. Always confirm the final code with
          customs or your broker.
        </InfoTip>
      </div>

      <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="description"
          type="text"
          placeholder="e.g. Men's cotton t-shirts, knitted"
          className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
        />
        <input
          name="destination"
          type="text"
          defaultValue="NG"
          aria-label="Destination country"
          className="w-full rounded-md border border-hairline bg-white px-3 py-2 font-mono text-sm uppercase text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal sm:w-24"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-deep-harbor px-5 py-2 text-sm font-medium text-white hover:bg-harbor-navy disabled:opacity-60"
        >
          {pending ? "Thinking..." : "Suggest codes"}
        </button>
      </form>

      {state?.status === "error" && (
        <p className="mt-4 text-sm text-danger">{state.message}</p>
      )}

      {state?.status === "success" && state.suggestions && (
        <ul className="mt-4 space-y-3">
          {state.suggestions.map((suggestion) => (
            <li
              key={`${suggestion.code}-${suggestion.description}`}
              className="rounded-lg border border-hairline bg-cloud p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-semibold text-deep-harbor">
                  {suggestion.code}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${confidenceStyles[suggestion.confidence]}`}
                >
                  {suggestion.confidence}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink">{suggestion.description}</p>
              {suggestion.reason && (
                <p className="mt-1 text-xs text-muted">{suggestion.reason}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        AI suggestions are a starting point only. Final classification is
        confirmed by customs.
      </p>
    </div>
  );
}
