import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export type InitializeTransactionInput = {
  email: string;
  amountNgn: number;
  plan: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
  planCode?: string;
};

export type CreatePlanInput = {
  name: string;
  amountNgn: number;
  interval: string;
};

export type InitializedTransaction = {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
};

export type VerifiedTransaction = {
  success: boolean;
  amountNgn: number;
  metadata: Record<string, unknown> | null;
};

export type DisableSubscriptionInput = {
  code: string;
  token: string;
};

type InitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type VerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    amount: number;
    metadata: Record<string, unknown> | null;
  };
};

type CreatePlanResponse = {
  status: boolean;
  message: string;
  data?: {
    plan_code: string;
  };
};

type DeletePlanResponse = {
  status: boolean;
  message: string;
};

type DisableSubscriptionResponse = {
  status: boolean;
  message: string;
};

function secretKey(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Paystack is not configured.");
  }
  return secret;
}

export async function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<InitializedTransaction> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNgn * 100),
      callback_url: input.callbackUrl,
      metadata: { ...input.metadata, plan: input.plan },
      ...(input.planCode ? { plan: input.planCode } : {}),
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as InitializeResponse;

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(
      payload.message || "Could not start the Paystack transaction.",
    );
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
    accessCode: payload.data.access_code,
  };
}

export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as VerifyResponse;

  if (!response.ok || !payload.status || !payload.data) {
    return { success: false, amountNgn: 0, metadata: null };
  }

  return {
    success: payload.data.status === "success",
    amountNgn: payload.data.amount / 100,
    metadata: payload.data.metadata ?? null,
  };
}

export async function createPlan(
  input: CreatePlanInput,
): Promise<{ planCode: string }> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      amount: Math.round(input.amountNgn * 100),
      interval: input.interval,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as CreatePlanResponse;

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message || "Could not create the Paystack plan.");
  }

  return { planCode: payload.data.plan_code };
}

export async function deletePlan(
  planCode: string,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/plan/${encodeURIComponent(planCode)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as DeletePlanResponse;

  return { success: response.ok && payload.status };
}

export async function disableSubscription(
  input: DisableSubscriptionInput,
): Promise<boolean> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: input.code, token: input.token }),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as DisableSubscriptionResponse;
  return payload.status;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha512", secret).update(rawBody).digest("hex"),
    "utf8",
  );
  const provided = Buffer.from(signature, "utf8");

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}
