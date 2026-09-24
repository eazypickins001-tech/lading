import { activateSubscription, isPaidPlan } from "@/lib/billing";
import { verifyWebhookSignature } from "@/lib/paystack";
import { cancelSubscriptionByProviderRef } from "@/lib/subscriptions";

export const runtime = "nodejs";

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    subscription_code?: string;
    email_token?: string;
    metadata?: Record<string, unknown> | null;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature.", { status: 401 });
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return new Response("Invalid payload.", { status: 400 });
  }

  if (payload.event === "charge.success") {
    const reference = payload.data?.reference;
    const metadata = payload.data?.metadata ?? {};
    const plan = typeof metadata.plan === "string" ? metadata.plan : null;
    const orgId = typeof metadata.orgId === "string" ? metadata.orgId : null;

    if (reference && orgId && plan && isPaidPlan(plan)) {
      try {
        await activateSubscription(orgId, plan, reference);
      } catch {
        return new Response("Activation failed.", { status: 500 });
      }
    }
  }

  if (payload.event === "subscription.create") {
    const metadata = payload.data?.metadata ?? {};
    const plan = typeof metadata.plan === "string" ? metadata.plan : null;
    const orgId = typeof metadata.orgId === "string" ? metadata.orgId : null;
    const subscriptionCode = payload.data?.subscription_code;
    const emailToken = payload.data?.email_token;

    if (orgId && plan && subscriptionCode && isPaidPlan(plan)) {
      try {
        await activateSubscription(orgId, plan, subscriptionCode, emailToken);
      } catch {
        return new Response("Activation failed.", { status: 500 });
      }
    }
  }

  if (
    payload.event === "subscription.disable" ||
    payload.event === "subscription.not_renew"
  ) {
    const subscriptionCode = payload.data?.subscription_code;

    if (subscriptionCode) {
      try {
        await cancelSubscriptionByProviderRef(subscriptionCode);
      } catch {
        return new Response("Cancellation failed.", { status: 500 });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
