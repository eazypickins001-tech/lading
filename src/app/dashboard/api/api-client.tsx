"use client";

import { useActionState } from "react";
import type { ApiKeyMetadata } from "@/lib/api-keys";
import type { WebhookDelivery, WebhookEndpoint } from "@/lib/webhooks";
import {
  createApiKeyAction,
  createWebhookEndpointAction,
  deleteWebhookEndpointAction,
  revokeApiKeyAction,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

const WEBHOOK_EVENT_OPTIONS = [
  "shipment.created",
  "status.changed",
  "document.generated",
];

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toISOString().slice(0, 16).replace("T", " ");
}

export function ApiClient({
  apiKeys,
  endpoints,
  deliveries,
  baseUrl,
}: {
  apiKeys: ApiKeyMetadata[];
  endpoints: WebhookEndpoint[];
  deliveries: WebhookDelivery[];
  baseUrl: string;
}) {
  const [keyState, keyAction, keyPending] = useActionState(
    createApiKeyAction,
    undefined,
  );
  const [webhookState, webhookAction, webhookPending] = useActionState(
    createWebhookEndpointAction,
    undefined,
  );

  const base = baseUrl ? `${baseUrl}/api/v1` : "https://your-app-url/api/v1";
  const endpointUrls = new Map(
    endpoints.map((endpoint) => [endpoint.id, endpoint.url]),
  );

  return (
    <div className="mt-10 space-y-10">
      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">API keys</h2>
        <p className="mt-1 text-sm text-muted">
          Keys authenticate server-to-server calls. The full key is shown once
          at creation and never stored in readable form.
        </p>

        <form action={keyAction} className="mt-5 flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label htmlFor="keyName" className={labelClass}>
              Key name
            </label>
            <input
              id="keyName"
              name="name"
              type="text"
              required
              placeholder="Production integration"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={keyPending}
            className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
          >
            {keyPending ? "Creating..." : "Create key"}
          </button>
        </form>

        {keyState?.status === "success" ? (
          <div className="mt-4 rounded-md border border-success/30 bg-success/5 px-4 py-3">
            <p className="text-sm font-medium text-success">
              Key created. Copy it now, it will not be shown again.
            </p>
            <code className="mt-2 block break-all font-mono text-sm text-ink">
              {keyState.plain}
            </code>
          </div>
        ) : null}

        {keyState?.status === "error" ? (
          <p className="mt-4 text-sm text-danger">{keyState.message}</p>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Prefix</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    No API keys yet.
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-4 py-3 text-ink">{key.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {key.keyPrefix}...
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {formatDate(key.lastUsedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          key.revokedAt
                            ? "rounded-full bg-cloud px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-danger"
                            : "rounded-full bg-cloud px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success"
                        }
                      >
                        {key.revokedAt ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {key.revokedAt ? (
                        <span className="text-xs text-muted">-</span>
                      ) : (
                        <form action={revokeApiKeyAction}>
                          <input type="hidden" name="id" value={key.id} />
                          <button
                            type="submit"
                            className="text-sm font-medium text-danger hover:underline"
                          >
                            Revoke
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">Webhooks</h2>
        <p className="mt-1 text-sm text-muted">
          Endpoints receive a signed JSON payload when events occur. Each
          request carries an X-Lading-Signature header with an HMAC-SHA256 of
          the raw body.
        </p>

        <form action={webhookAction} className="mt-5 space-y-4">
          <div>
            <label htmlFor="webhookUrl" className={labelClass}>
              Endpoint URL
            </label>
            <input
              id="webhookUrl"
              name="url"
              type="url"
              required
              placeholder="https://example.com/webhooks/lading"
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Events</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {WEBHOOK_EVENT_OPTIONS.map((event) => (
                <label
                  key={event}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    name="events"
                    value={event}
                    className="h-4 w-4 rounded border-hairline text-signal-teal focus:ring-signal-teal"
                  />
                  <span className="font-mono text-xs">{event}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={webhookPending}
            className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
          >
            {webhookPending ? "Adding..." : "Add endpoint"}
          </button>
        </form>

        {webhookState?.status === "success" ? (
          <div className="mt-4 rounded-md border border-success/30 bg-success/5 px-4 py-3">
            <p className="text-sm font-medium text-success">
              Endpoint added. Use this signing secret to verify deliveries. It
              will not be shown again.
            </p>
            <code className="mt-2 block break-all font-mono text-sm text-ink">
              {webhookState.secret}
            </code>
          </div>
        ) : null}

        {webhookState?.status === "error" ? (
          <p className="mt-4 text-sm text-danger">{webhookState.message}</p>
        ) : null}

        <ul className="mt-6 space-y-3">
          {endpoints.length === 0 ? (
            <li className="text-sm text-muted">No webhook endpoints yet.</li>
          ) : (
            endpoints.map((endpoint) => (
              <li
                key={endpoint.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-cloud p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-ink">
                    {endpoint.url}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {endpoint.events.map((event) => (
                      <span
                        key={event}
                        className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <form action={deleteWebhookEndpointAction} className="shrink-0">
                  <input type="hidden" name="id" value={endpoint.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted">
          Recent deliveries
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Endpoint</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    No deliveries yet.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      {delivery.event}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {endpointUrls.get(delivery.endpointId) ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          delivery.ok
                            ? "font-mono text-xs text-success"
                            : "font-mono text-xs text-danger"
                        }
                      >
                        {delivery.statusCode ?? "error"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {formatDate(delivery.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">
          API reference
        </h2>
        <p className="mt-1 text-sm text-muted">
          Base URL{" "}
          <code className="font-mono text-xs text-ink">{base}</code>. Send your
          key in the Authorization header as{" "}
          <code className="font-mono text-xs text-ink">
            Authorization: Bearer ldg_...
          </code>
          . Requests are limited to 120 per minute per key.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-teal">
              GET /shipments
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-deep-harbor px-4 py-3 font-mono text-xs text-white">
              {`curl ${base}/shipments \\\n  -H "Authorization: Bearer ldg_your_key"`}
            </pre>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-teal">
              POST /shipments
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-deep-harbor px-4 py-3 font-mono text-xs text-white">
              {`curl -X POST ${base}/shipments \\\n  -H "Authorization: Bearer ldg_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"channel":"import","originCountry":"CN","destinationCountry":"NG","mode":"sea","items":[{"description":"Solar panels","quantity":100,"unit":"pcs","unitValue":120}]}'`}
            </pre>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-teal">
              GET /shipments/&#123;id&#125;
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-deep-harbor px-4 py-3 font-mono text-xs text-white">
              {`curl ${base}/shipments/SHIPMENT_ID \\\n  -H "Authorization: Bearer ldg_your_key"`}
            </pre>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-teal">
              POST /requirements
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-deep-harbor px-4 py-3 font-mono text-xs text-white">
              {`curl -X POST ${base}/requirements \\\n  -H "Authorization: Bearer ldg_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"hsCode":"850440","originCountry":"CN","destinationCountry":"NG","channel":"import"}'`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
