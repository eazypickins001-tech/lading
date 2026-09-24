"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="space-y-4">
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
          autoComplete="current-password"
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
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
