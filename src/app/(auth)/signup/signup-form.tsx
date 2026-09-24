"use client";

import { useActionState } from "react";
import { signUp } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);

  if (state?.success) {
    return (
      <div className="rounded-md border border-hairline bg-cloud p-4 text-sm text-ink">
        {state.success}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-ink">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
        />
      </div>

      <div>
        <label
          htmlFor="organizationName"
          className="block text-sm font-medium text-ink"
        >
          Organization name
        </label>
        <input
          id="organizationName"
          name="organizationName"
          type="text"
          autoComplete="organization"
          required
          className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
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
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
