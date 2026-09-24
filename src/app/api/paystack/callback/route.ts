import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { activateSubscription, isPaidPlan } from "@/lib/billing";
import { verifyTransaction } from "@/lib/paystack";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get("reference") ??
    request.nextUrl.searchParams.get("trxref");
  const plan = request.nextUrl.searchParams.get("plan");

  let activated = false;

  if (reference) {
    try {
      const verified = await verifyTransaction(reference);
      const metadata = verified.metadata ?? {};
      const resolvedPlan =
        typeof metadata.plan === "string" ? metadata.plan : plan;
      const orgId = typeof metadata.orgId === "string" ? metadata.orgId : null;

      if (
        verified.success &&
        orgId &&
        resolvedPlan &&
        isPaidPlan(resolvedPlan)
      ) {
        await activateSubscription(orgId, resolvedPlan, reference);
        activated = true;
      }
    } catch {
      activated = false;
    }
  }

  if (activated) {
    redirect("/dashboard/billing?status=success");
  }

  redirect("/dashboard/billing?status=failed");
}
