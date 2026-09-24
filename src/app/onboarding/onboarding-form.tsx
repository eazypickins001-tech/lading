"use client";

import { useActionState } from "react";
import { createOrganization } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createOrganization, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Organization name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-ink">
          Type
        </label>
        <select id="type" name="type" defaultValue="trader" className={inputClass}>
          <option value="trader">Trader</option>
          <option value="agent">Agent</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-ink">
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          defaultValue="NG"
          autoComplete="country"
          className={inputClass}
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-signal-teal px-4 py-2 font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create organization"}
      </button>
    </form>
  );
}
