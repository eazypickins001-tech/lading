import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PlanId =
  | "free"
  | "starter"
  | "professional"
  | "organization"
  | "agent";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceNgn: number;
  documentsPerMonth: number;
  shipmentsPerMonth: number;
  users: number;
  features: string[];
  highlight?: boolean;
};

export type Usage = {
  docsCreated: number;
  shipmentsCreated: number;
};

export type Entitlement = {
  plan: PlanDefinition;
  usage: Usage;
  limits: {
    documentsPerMonth: number;
    shipmentsPerMonth: number;
    users: number;
  };
  canCreateDocument: boolean;
  canCreateShipment: boolean;
};

export type UsageKind = "document" | "shipment";

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceNgn: 0,
    documentsPerMonth: 10,
    shipmentsPerMonth: 3,
    users: 1,
    features: [
      "3 shipments per month",
      "10 documents per month",
      "Single user",
      "Core document set",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceNgn: 10000,
    documentsPerMonth: 50,
    shipmentsPerMonth: 25,
    users: 2,
    features: [
      "25 shipments per month",
      "50 documents per month",
      "2 users",
      "Consistency checks",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    priceNgn: 35000,
    documentsPerMonth: 200,
    shipmentsPerMonth: 100,
    users: 5,
    features: [
      "100 shipments per month",
      "200 documents per month",
      "5 users",
      "Priority support",
    ],
    highlight: true,
  },
  organization: {
    id: "organization",
    name: "Organization",
    priceNgn: 90000,
    documentsPerMonth: 1000,
    shipmentsPerMonth: 500,
    users: 20,
    features: [
      "500 shipments per month",
      "1000 documents per month",
      "20 users",
      "Dedicated onboarding",
    ],
  },
  agent: {
    id: "agent",
    name: "Agent",
    priceNgn: 50000,
    documentsPerMonth: 300,
    shipmentsPerMonth: 150,
    users: 10,
    features: [
      "150 shipments per month",
      "300 documents per month",
      "10 users",
      "Client workspaces",
    ],
  },
};

export function planFor(id: string): PlanDefinition {
  return PLANS[id as PlanId] ?? PLANS.free;
}

export function isPaidPlan(id: string): id is PlanId {
  return id !== "free" && id in PLANS;
}

function currentPeriodStart(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export async function getUsage(orgId: string): Promise<Usage> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usage_counters")
    .select("docs_created, shipments_created")
    .eq("org_id", orgId)
    .eq("period_start", currentPeriodStart())
    .maybeSingle();

  const row = data as
    | { docs_created: number; shipments_created: number }
    | null;

  return {
    docsCreated: row?.docs_created ?? 0,
    shipmentsCreated: row?.shipments_created ?? 0,
  };
}

export async function getOrgPlan(orgId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .maybeSingle();

  return (data as { plan: string } | null)?.plan ?? "free";
}

export async function getEntitlement(
  orgId: string,
  plan: string,
): Promise<Entitlement> {
  const definition = planFor(plan);
  const usage = await getUsage(orgId);

  return {
    plan: definition,
    usage,
    limits: {
      documentsPerMonth: definition.documentsPerMonth,
      shipmentsPerMonth: definition.shipmentsPerMonth,
      users: definition.users,
    },
    canCreateDocument: usage.docsCreated < definition.documentsPerMonth,
    canCreateShipment: usage.shipmentsCreated < definition.shipmentsPerMonth,
  };
}

export async function incrementUsage(
  orgId: string,
  kind: UsageKind,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_usage", {
    p_org: orgId,
    p_kind: kind,
  });

  if (error) {
    throw new Error("Could not record usage for the organization.");
  }
}

export async function activateSubscription(
  orgId: string,
  plan: PlanId,
  reference: string,
): Promise<void> {
  const admin = createAdminClient();
  const periodStart = new Date();
  const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { error: orgError } = await admin
    .from("organizations")
    .update({ plan })
    .eq("id", orgId);

  if (orgError) {
    throw new Error("Could not update the organization plan.");
  }

  const values = {
    plan,
    status: "active",
    provider: "paystack",
    provider_ref: reference,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
  };

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("subscriptions")
      .update(values)
      .eq("id", (existing as { id: string }).id);

    if (error) {
      throw new Error("Could not update the subscription.");
    }
    return;
  }

  const { error } = await admin
    .from("subscriptions")
    .insert({ org_id: orgId, ...values });

  if (error) {
    throw new Error("Could not save the subscription.");
  }
}
