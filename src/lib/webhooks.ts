import { createHmac, randomBytes } from "node:crypto";
import { getActiveOrg } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const WEBHOOK_EVENTS = [
  "shipment.created",
  "status.changed",
  "document.generated",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export type WebhookEndpoint = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
};

export type CreatedWebhookEndpoint = WebhookEndpoint & { secret: string };

export type WebhookDelivery = {
  id: string;
  endpointId: string;
  event: string;
  statusCode: number | null;
  ok: boolean | null;
  createdAt: string;
};

type EndpointRow = {
  id: string;
  url: string;
  events: string[] | null;
  active: boolean;
  created_at: string;
};

type EndpointSecretRow = EndpointRow & { secret: string };

type DeliveryRow = {
  id: string;
  endpoint_id: string;
  event: string;
  status_code: number | null;
  ok: boolean | null;
  created_at: string;
};

function toEndpoint(row: EndpointRow): WebhookEndpoint {
  return {
    id: row.id,
    url: row.url,
    events: row.events ?? [],
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function listWebhookEndpoints(): Promise<WebhookEndpoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .select("id, url, events, active, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as EndpointRow[]).map(toEndpoint);
}

export async function createWebhookEndpoint(input: {
  url: string;
  events: string[];
}): Promise<CreatedWebhookEndpoint> {
  const organization = await getActiveOrg();
  if (!organization) {
    throw new Error("No active organization.");
  }

  const secret = randomBytes(32).toString("hex");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .insert({
      org_id: organization.id,
      url: input.url,
      secret,
      events: input.events,
    })
    .select("id, url, events, active, created_at, secret")
    .single();

  if (error || !data) {
    throw new Error("Could not create the webhook endpoint.");
  }

  const row = data as EndpointSecretRow;
  return { ...toEndpoint(row), secret: row.secret };
}

export async function deleteWebhookEndpoint(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("webhook_endpoints").delete().eq("id", id);
}

export async function listWebhookDeliveries(
  limit = 20,
): Promise<WebhookDelivery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhook_deliveries")
    .select("id, endpoint_id, event, status_code, ok, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as DeliveryRow[]).map((row) => ({
    id: row.id,
    endpointId: row.endpoint_id,
    event: row.event,
    statusCode: row.status_code,
    ok: row.ok,
    createdAt: row.created_at,
  }));
}

export async function dispatchWebhook(
  orgId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("webhook_endpoints")
      .select("id, url, secret")
      .eq("org_id", orgId)
      .eq("active", true)
      .contains("events", [event]);

    if (error || !data) {
      return;
    }

    const body = JSON.stringify({ event, data: payload, sentAt: new Date().toISOString() });

    for (const row of data as { id: string; url: string; secret: string }[]) {
      const signature = createHmac("sha256", row.secret)
        .update(body, "utf8")
        .digest("hex");

      let statusCode: number | null = null;
      let ok = false;

      try {
        const response = await fetch(row.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Lading-Signature": `sha256=${signature}`,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });
        statusCode = response.status;
        ok = response.ok;
      } catch {
        ok = false;
      }

      await admin.from("webhook_deliveries").insert({
        endpoint_id: row.id,
        event,
        status_code: statusCode,
        ok,
      });
    }
  } catch {
    return;
  }
}
