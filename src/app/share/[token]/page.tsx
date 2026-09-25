import type { Metadata } from "next";
import { Disclaimer } from "@/components/disclaimer";
import { LadingLogo } from "@/components/lading-logo";
import { recordAuditEvent } from "@/lib/audit";
import { getShareLinkByToken } from "@/lib/share-links";
import { getShipmentWithItems } from "@/lib/shipments";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Shared shipment",
};

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= new Date().getTime();
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <LadingLogo variant="onLight" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-deep-harbor">
        {title}
      </h1>
      <p className="mt-3 text-muted">{body}</p>
    </main>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const link = await getShareLinkByToken(token, admin);
  if (!link) {
    return (
      <Message
        title="Link not found"
        body="This share link does not exist or has been revoked."
      />
    );
  }

  if (isExpired(link.expiresAt)) {
    return (
      <Message
        title="Link expired"
        body="This share link has expired. Ask the sender for a new one."
      />
    );
  }

  const shipment = await getShipmentWithItems(link.shipmentId, admin);
  if (!shipment) {
    return (
      <Message
        title="Shipment unavailable"
        body="The shared shipment could not be found."
      />
    );
  }

  await recordAuditEvent(
    {
      orgId: shipment.org_id,
      userId: null,
      action: "share.view",
      entityType: "shipment",
      entityId: shipment.id,
      metadata: { token },
    },
    admin,
  );

  const reference = shipment.reference ?? shipment.id.slice(0, 8);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <LadingLogo variant="onLight" />

      <div className="mt-10 rounded-xl border border-hairline bg-white p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Shared shipment
        </p>
        <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-deep-harbor">
          {reference}
        </h1>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-widest text-muted">
              Route
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {shipment.origin_country} to {shipment.destination_country}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-widest text-muted">
              Channel
            </dt>
            <dd className="mt-1 text-sm capitalize text-ink">
              {shipment.channel}
            </dd>
          </div>
        </dl>

        <a
          href={`/api/share/${token}/documents/set`}
          className="mt-8 inline-flex rounded-md bg-signal-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
        >
          Download document set
        </a>

        <p className="mt-4 text-xs text-muted">
          This link expires on {new Date(link.expiresAt).toISOString().slice(0, 10)}.
        </p>
      </div>

      <Disclaimer variant="compact" className="mt-8" />
    </main>
  );
}
