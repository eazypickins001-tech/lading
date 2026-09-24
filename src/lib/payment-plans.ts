import { PLANS, isPaidPlan, planFor, type PlanId } from "@/lib/billing";
import { createPlan } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

type PaymentPlanRow = {
  paystack_plan_code: string;
};

export async function getStoredPlanCode(planId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payment_plans")
    .select("paystack_plan_code")
    .eq("plan_id", planId)
    .maybeSingle();

  return (data as PaymentPlanRow | null)?.paystack_plan_code ?? null;
}

export async function ensurePaystackPlan(planId: string): Promise<string> {
  if (!isPaidPlan(planId)) {
    throw new Error("Only paid plans can be synced with Paystack.");
  }

  const stored = await getStoredPlanCode(planId);
  if (stored) {
    return stored;
  }

  const plan = planFor(planId);
  const { planCode } = await createPlan({
    name: `Lading ${plan.name}`,
    amountNgn: plan.priceNgn,
    interval: "monthly",
  });

  const admin = createAdminClient();
  const { error } = await admin.from("payment_plans").upsert(
    {
      plan_id: plan.id,
      paystack_plan_code: planCode,
      amount_ngn: plan.priceNgn,
      interval: "monthly",
    },
    { onConflict: "plan_id" },
  );

  if (error) {
    throw new Error("Could not store the Paystack plan.");
  }

  return planCode;
}

export async function ensureAllPaystackPlans(): Promise<
  Record<string, string>
> {
  const paidPlanIds = (Object.keys(PLANS) as PlanId[]).filter((id) =>
    isPaidPlan(id),
  );

  const entries = await Promise.all(
    paidPlanIds.map(
      async (id) => [id, await ensurePaystackPlan(id)] as const,
    ),
  );

  return Object.fromEntries(entries);
}
