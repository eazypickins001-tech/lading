import { createAdminClient } from "@/lib/supabase/admin";
import { disableSubscription } from "@/lib/paystack";
import type { PlanId } from "@/lib/billing";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  provider: string | null;
  providerRef: string | null;
  providerToken: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type CancelSubscriptionResult =
  | { ok: true; accessUntil: string | null }
  | { ok: false; message: string };

type SubscriptionRow = {
  id: string;
  plan: string;
  status: string;
  provider: string | null;
  provider_ref: string | null;
  provider_token: string | null;
  period_start: string | null;
  period_end: string | null;
};

const SUBSCRIPTION_COLUMNS =
  "id, plan, status, provider, provider_ref, provider_token, period_start, period_end";

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    plan: row.plan as PlanId,
    status: row.status as SubscriptionStatus,
    provider: row.provider,
    providerRef: row.provider_ref,
    providerToken: row.provider_token,
    periodStart: row.period_start,
    periodEnd: row.period_end,
  };
}

export async function getActiveSubscription(
  orgId: string,
): Promise<Subscription | null> {
  const admin = createAdminClient();

  const { data: active } = await admin
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("org_id", orgId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) {
    return toSubscription(active as SubscriptionRow);
  }

  const { data: latest } = await admin
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest ? toSubscription(latest as SubscriptionRow) : null;
}

export function isWithinPeriod(periodEnd: string | null): boolean {
  if (!periodEnd) {
    return false;
  }

  return new Date(periodEnd).getTime() > Date.now();
}

async function expireSubscription(
  subscriptionId: string,
  orgId: string,
): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("id", subscriptionId);

  await admin.from("organizations").update({ plan: "free" }).eq("id", orgId);
}

export async function getEffectivePlan(
  orgId: string,
  fallbackPlan: string,
): Promise<string> {
  const subscription = await getActiveSubscription(orgId);

  if (!subscription) {
    return fallbackPlan;
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    if (!subscription.periodEnd || isWithinPeriod(subscription.periodEnd)) {
      return subscription.plan;
    }

    await expireSubscription(subscription.id, orgId);
    return "free";
  }

  if (subscription.status === "cancelled") {
    if (subscription.periodEnd && isWithinPeriod(subscription.periodEnd)) {
      return subscription.plan;
    }

    await expireSubscription(subscription.id, orgId);
    return "free";
  }

  return fallbackPlan;
}

export async function cancelSubscription(
  orgId: string,
): Promise<CancelSubscriptionResult> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("org_id", orgId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { ok: false, message: "There is no active subscription to cancel." };
  }

  const subscription = toSubscription(data as SubscriptionRow);

  if (
    subscription.provider === "paystack" &&
    subscription.providerRef &&
    subscription.providerToken
  ) {
    await disableSubscription({
      code: subscription.providerRef,
      token: subscription.providerToken,
    });
  }

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("id", subscription.id);

  if (error) {
    return { ok: false, message: "Could not cancel the subscription." };
  }

  return { ok: true, accessUntil: subscription.periodEnd };
}

export async function cancelSubscriptionByProviderRef(
  providerRef: string,
): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("provider_ref", providerRef);
}
