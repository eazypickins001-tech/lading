import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { listApiKeys } from "@/lib/api-keys";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { listWebhookDeliveries, listWebhookEndpoints } from "@/lib/webhooks";
import { ApiClient } from "./api-client";

export default async function ApiPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const [apiKeys, endpoints, deliveries] = await Promise.all([
    listApiKeys(),
    listWebhookEndpoints(),
    listWebhookDeliveries(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="api" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          API and webhooks
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Create keys to call the Lading API and register webhook endpoints to
          receive shipment events for {organization.name}.
        </p>

        <ApiClient
          apiKeys={apiKeys}
          endpoints={endpoints}
          deliveries={deliveries}
          baseUrl={baseUrl}
        />
      </main>
    </div>
  );
}
