"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export type ProfileFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
};

export function ProfileForm({ profile }: { profile: ProfileFormValues }) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    undefined,
  );

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="full_name" className={labelClass}>
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          defaultValue={profile.fullName}
          required
          className={inputClass}
        />
        {fieldError("full_name") ? (
          <p className="mt-1 text-xs text-danger">{fieldError("full_name")}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={profile.email}
          readOnly
          className={`${inputClass} cursor-not-allowed bg-cloud text-muted`}
        />
        <p className="mt-1 text-xs text-muted">
          Email is managed by your sign-in and cannot be changed here.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={profile.phone}
          placeholder="+234 800 000 0000"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="country" className={labelClass}>
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          autoComplete="country"
          defaultValue={profile.country}
          placeholder="NG"
          className={`${inputClass} font-mono uppercase`}
        />
      </div>

      {state?.status === "success" ? (
        <p className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      ) : null}

      {state?.status === "error" ? (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-signal-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
