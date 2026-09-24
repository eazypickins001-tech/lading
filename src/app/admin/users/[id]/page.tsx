import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InfoTip } from "@/components/info-tip";
import { requireAdmin } from "@/lib/admin";
import { getAdminUser } from "@/lib/admin-data";
import { PLANS } from "@/lib/billing";
import {
  ChangePlanForm,
  EditProfileForm,
  GenerateResetLinkForm,
  SetPasswordForm,
} from "./user-forms";

export const metadata: Metadata = {
  title: "User",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateOrDash(value: string | null): string {
  return value ? formatDate(value) : "-";
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-all font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const user = await getAdminUser(id);

  if (!user) {
    notFound();
  }

  const plans = Object.values(PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
  }));

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm font-medium text-muted hover:text-ink"
      >
        ← Back to users
      </Link>

      <div className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          User
        </p>
        <h1 className="mt-2 break-all text-3xl font-semibold tracking-tight">
          {user.email || user.id}
        </h1>
      </div>

      <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Account
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="User ID" value={user.id} />
          <Fact label="Email" value={user.email || "-"} />
          <Fact label="Created" value={formatDate(user.createdAt)} />
          <Fact
            label="Last sign-in"
            value={formatDateOrDash(user.lastSignInAt)}
          />
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Edit profile
        </h2>
        <p className="mt-2 text-sm text-muted">
          Update the user&apos;s display name, phone, and country.
        </p>
        <div className="mt-5 max-w-xl">
          <EditProfileForm
            userId={user.id}
            fullName={user.profile?.fullName ?? ""}
            phone={user.profile?.phone ?? ""}
            country={user.profile?.country ?? ""}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Password
        </h2>
        <div className="mt-5 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-ink">Set a new password</h3>
            <p className="mt-1 text-sm text-muted">
              Set a password directly for this user.
            </p>
            <div className="mt-4">
              <SetPasswordForm userId={user.id} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink">
              Generate reset link
            </h3>
            <p className="mt-1 text-sm text-muted">
              Create a one-time link the user can follow to set a new password.
            </p>
            <div className="mt-4">
              <GenerateResetLinkForm userId={user.id} email={user.email} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-hairline bg-white p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Organizations and plan
          </h2>
          <InfoTip label="How manual plan changes work">
            Manual plan changes override billing. Setting a plan to Free cancels
            any active subscription for the organization.
          </InfoTip>
        </div>

        {user.organizations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            This user does not belong to any organization yet.
          </p>
        ) : (
          <div className="mt-5 space-y-6">
            {user.organizations.map((organization) => (
              <div
                key={organization.id}
                className="rounded-lg border border-hairline p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-deep-harbor">
                      {organization.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {organization.type} - role: {organization.role}
                    </p>
                  </div>
                  <span className="rounded-full border border-hairline bg-cloud px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
                    {organization.plan}
                  </span>
                </div>
                <div className="mt-4 max-w-xs">
                  <ChangePlanForm
                    orgId={organization.id}
                    userId={user.id}
                    currentPlan={organization.plan}
                    plans={plans}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
