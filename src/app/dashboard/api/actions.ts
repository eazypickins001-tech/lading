"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createApiKey, revokeApiKey } from "@/lib/api-keys";
import { recordAuditEvent } from "@/lib/audit";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  WEBHOOK_EVENTS,
  type WebhookEvent,
} from "@/lib/webhooks";

export type ApiKeyState =
  | { status: "success"; name: string; plain: string }
  | { status: "error"; message: string }
  | undefined;

export type WebhookState =
  | { status: "success"; url: string; secret: string }
  | { status: "error"; message: string }
  | undefined;

const MANAGE_ROLES = ["owner", "admin"];

export async function createApiKeyAction(
  state: ApiKeyState,
  formData: FormData,
): Promise<ApiKeyState> {
  void state;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!MANAGE_ROLES.includes(organization.role)) {
    return { status: "error", message: "Only owners and admins can manage API keys." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { status: "error", message: "Give the key a name." };
  }

  try {
    const created = await createApiKey(organization.id, name);
    await recordAuditEvent({
      orgId: organization.id,
      userId: user.id,
      action: "api_key.create",
      entityType: "api_key",
      entityId: created.id,
      metadata: { name },
    });
    revalidatePath("/dashboard/api");
    return { status: "success", name, plain: created.plain };
  } catch {
    return { status: "error", message: "Could not create the API key." };
  }
}

export async function revokeApiKeyAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }

  await revokeApiKey(id);
  await recordAuditEvent({
    orgId: organization.id,
    userId: user.id,
    action: "api_key.revoke",
    entityType: "api_key",
    entityId: id,
  });

  revalidatePath("/dashboard/api");
}

export async function createWebhookEndpointAction(
  state: WebhookState,
  formData: FormData,
): Promise<WebhookState> {
  void state;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!MANAGE_ROLES.includes(organization.role)) {
    return {
      status: "error",
      message: "Only owners and admins can manage webhooks.",
    };
  }

  const url = String(formData.get("url") ?? "").trim();
  if (!/^https?:\/\/.+/i.test(url)) {
    return { status: "error", message: "Enter a valid http or https URL." };
  }

  const events = formData
    .getAll("events")
    .map((value) => String(value))
    .filter((value): value is WebhookEvent =>
      (WEBHOOK_EVENTS as readonly string[]).includes(value),
    );

  if (events.length === 0) {
    return { status: "error", message: "Select at least one event." };
  }

  try {
    const created = await createWebhookEndpoint({ url, events });
    await recordAuditEvent({
      orgId: organization.id,
      userId: user.id,
      action: "webhook.create",
      entityType: "webhook_endpoint",
      entityId: created.id,
      metadata: { url, events },
    });
    revalidatePath("/dashboard/api");
    return { status: "success", url: created.url, secret: created.secret };
  } catch {
    return { status: "error", message: "Could not create the webhook endpoint." };
  }
}

export async function deleteWebhookEndpointAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  const organization = await getActiveOrg();
  if (!organization) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }

  await deleteWebhookEndpoint(id);
  await recordAuditEvent({
    orgId: organization.id,
    userId: user.id,
    action: "webhook.delete",
    entityType: "webhook_endpoint",
    entityId: id,
  });

  revalidatePath("/dashboard/api");
}
