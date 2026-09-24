import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import {
  PLANS,
  getEntitlement,
  planFor,
  type PlanDefinition,
} from "@/lib/billing";
import { startCheckoutAction } from "./actions";

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  const atLimit = used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-xs text-muted">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className={`h-full rounded-full ${
            atLimit ? "bg-danger" : "bg-signal-teal"
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  currentPlanId,
}: {
  plan: PlanDefinition;
  currentPlanId: string;
}) {
  const isCurrent = plan.id === currentPlanId;

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-6 ${
        isCurrent ? "border-signal-teal" : "border-hairline"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-deep-harbor">{plan.name}</h3>
        {isCurrent ? (
          <span className="rounded-full bg-signal-teal/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-signal-teal">
            Current
          </span>
        ) : plan.highlight ? (
          <span className="rounded-full bg-manifest-amber/15 px-3 py-1 font-mono text-xs uppercase tracking-widest text-manifest-amber">
            Popular
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-2xl font-semibold text-deep-harbor">
        {plan.priceNgn === 0 ? "Free" : formatNgn(plan.priceNgn)}
        {plan.priceNgn > 0 ? (
          <span className="text-sm font-normal text-muted"> / month</span>
        ) : null}
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 text-signal-teal" aria-hidden="true">
              &#10003;
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isCurrent ? (
          <span className="block rounded-md border border-hairline px-4 py-2 text-center text-sm font-medium text-muted">
            Your plan
          </span>
        ) : (
          <form action={startCheckoutAction}>
            <input type="hidden" name="plan" value={plan.id} />
            <button
              type="submit"
              className="w-full rounded-md bg-signal-teal px-4 py-2 text-sm font-medium text-white hover:bg-signal-teal/90"
            >
              Choose plan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : null;
  const limit = typeof params.limit === "string" ? params.limit : null;

  const entitlement = await getEntitlement(organization.id, organization.plan);
  const currentPlan = planFor(organization.plan);

  const banner =
    status === "success"
      ? {
          tone: "success" as const,
          message: "Payment received. Your plan is now active.",
        }
      : status === "failed"
        ? {
            tone: "danger" as const,
            message: "We could not confirm that payment. Please try again.",
          }
        : limit === "documents"
          ? {
              tone: "warning" as const,
              message:
                "You have reached your document limit. Upgrade to generate more.",
            }
          : limit === "shipments"
            ? {
                tone: "warning" as const,
                message:
                  "You have reached your shipment limit. Upgrade to create more.",
              }
            : null;

  const bannerClass =
    banner?.tone === "success"
      ? "border-success/30 bg-success/10 text-success"
      : banner?.tone === "danger"
        ? "border-danger/30 bg-danger/10 text-danger"
        : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="billing" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Billing and plans
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Manage your subscription, track this month&apos;s usage, and upgrade
          when you need more. Payments are in NGN via Paystack.
        </p>

        {banner ? (
          <div
            className={`mt-8 rounded-xl border px-5 py-4 text-sm ${bannerClass}`}
            role="status"
          >
            {banner.message}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Current plan
            </h2>
            <p className="mt-3 text-2xl font-semibold text-deep-harbor">
              {currentPlan.name}
            </p>
            <p className="mt-1 text-sm text-muted">
              {currentPlan.priceNgn === 0
                ? "No monthly charge"
                : `${formatNgn(currentPlan.priceNgn)} per month`}{" "}
              · {entitlement.limits.users}{" "}
              {entitlement.limits.users === 1 ? "user" : "users"}
            </p>
          </section>

          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              This month
            </h2>
            <div className="mt-5 space-y-5">
              <UsageBar
                label="Documents"
                used={entitlement.usage.docsCreated}
                limit={entitlement.limits.documentsPerMonth}
              />
              <UsageBar
                label="Shipments"
                used={entitlement.usage.shipmentsCreated}
                limit={entitlement.limits.shipmentsPerMonth}
              />
            </div>
          </section>
        </div>

        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Plans
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(PLANS).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentPlanId={currentPlan.id}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
