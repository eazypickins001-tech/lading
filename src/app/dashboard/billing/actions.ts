"use server";

import { redirect } from "next/navigation";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { isPaidPlan, planFor } from "@/lib/billing";
import { initializeTransaction } from "@/lib/paystack";

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const planId = String(formData.get("plan") ?? "").trim();

  if (!isPaidPlan(planId)) {
    redirect("/dashboard/billing?status=failed");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const plan = planFor(planId);
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback?plan=${plan.id}`;

  const transaction = await initializeTransaction({
    email: user.email ?? "",
    amountNgn: plan.priceNgn,
    plan: plan.id,
    callbackUrl,
    metadata: { orgId: organization.id, plan: plan.id },
  }).catch(() => null);

  if (!transaction) {
    redirect("/dashboard/billing?status=failed");
  }

  redirect(transaction.authorizationUrl);
}
