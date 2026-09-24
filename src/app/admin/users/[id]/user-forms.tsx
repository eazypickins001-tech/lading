"use client";

import { useActionState } from "react";
import {
  changeOrgPlanAction,
  generateResetLinkAction,
  setUserPasswordAction,
  updateUserProfileAction,
  type AdminUserActionState,
} from "../actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";
const buttonClass =
  "rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60";

function Message({ state }: { state: AdminUserActionState }) {
  if (!state) {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success"
          : "rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
      }
    >
      {state.message}
    </p>
  );
}

export function EditProfileForm({
  userId,
  fullName,
  phone,
  country,
}: {
  userId: string;
  fullName: string;
  phone: string;
  country: string;
}) {
  const [state, action, pending] = useActionState(
    updateUserProfileAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={fullName}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
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
          defaultValue={country}
          className={`${inputClass} font-mono uppercase`}
        />
      </div>

      <Message state={state} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

export function SetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    setUserPasswordAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

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
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirm" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </div>

      <Message state={state} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Updating..." : "Set password"}
      </button>
    </form>
  );
}

export function GenerateResetLinkForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    generateResetLinkAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="email" value={email} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Generating..." : "Generate reset link"}
      </button>

      {state?.status === "error" ? (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      {state?.status === "success" && state.link ? (
        <div>
          <label htmlFor="resetLink" className={labelClass}>
            Reset link
          </label>
          <input
            id="resetLink"
            type="text"
            readOnly
            value={state.link}
            onFocus={(event) => event.currentTarget.select()}
            className={`${inputClass} font-mono text-xs`}
          />
          <p className="mt-1 text-xs text-muted">
            Copy this link and send it to the user. It lets them set a new
            password.
          </p>
        </div>
      ) : null}
    </form>
  );
}

export function ChangePlanForm({
  orgId,
  userId,
  currentPlan,
  plans,
}: {
  orgId: string;
  userId: string;
  currentPlan: string;
  plans: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    changeOrgPlanAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label htmlFor={`plan-${orgId}`} className={labelClass}>
          Plan
        </label>
        <select
          id={`plan-${orgId}`}
          name="plan"
          defaultValue={currentPlan}
          className={inputClass}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <Message state={state} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save plan"}
      </button>
    </form>
  );
}
