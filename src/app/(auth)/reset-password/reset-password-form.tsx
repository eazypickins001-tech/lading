"use client";

import { useActionState, useState } from "react";
import { updatePassword } from "../actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClass}
        />
      </div>

      {tooShort ? (
        <p className="text-sm text-danger">
          Password must be at least 8 characters.
        </p>
      ) : null}

      {mismatch ? (
        <p className="text-sm text-danger">Passwords do not match.</p>
      ) : null}

      {state?.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || tooShort || mismatch}
        className="w-full rounded-md bg-signal-teal px-4 py-2 font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
