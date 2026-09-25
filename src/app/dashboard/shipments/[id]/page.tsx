import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChannelBadge, StatusBadge } from "@/components/shipment-badges";
import { ConsistencyFindings } from "@/components/consistency-findings";
import { DashboardHeader } from "@/components/dashboard-header";
import { RequiredDocumentsList } from "@/components/required-documents";
import { getCurrentUser } from "@/lib/auth";
import { listFindings } from "@/lib/consistency-store";
import { formatMoney, formatNumber, titleCase } from "@/lib/documents/pdf";
import { getShipmentRequirements } from "@/lib/requirements";
import { listScreeningResults } from "@/lib/screening";
import { listShipmentAccess } from "@/lib/shipment-access";
import { getShipmentWithItems } from "@/lib/shipments";
import { listShareLinks } from "@/lib/share-links";
import { listShipmentFiles } from "@/lib/storage";
import {
  createShareLinkAction,
  deleteShipmentFileAction,
  grantShipmentAccessAction,
  revokeShareLinkAction,
  revokeShipmentAccessAction,
  uploadShipmentFileAction,
} from "../actions";
import { ScreeningCard } from "./screening-card";

const documents = [
  { type: "commercial-invoice", label: "Commercial Invoice" },
  { type: "packing-list", label: "Packing List" },
  { type: "proforma-invoice", label: "Proforma Invoice" },
  { type: "certificate-of-origin", label: "Certificate of Origin" },
  { type: "bill-of-lading", label: "Bill of Lading" },
  { type: "airway-bill", label: "Air Waybill" },
  {
    type: "shippers-letter-of-instruction",
    label: "Shipper's Letter of Instruction",
  },
  { type: "vgm-declaration", label: "VGM Declaration" },
  { type: "packing-declaration", label: "Packing Declaration" },
];

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const shipment = await getShipmentWithItems(id);
  if (!shipment) {
    notFound();
  }

  const requiredDocuments = await getShipmentRequirements(shipment);
  const findings = await listFindings(id);
  const [files, shareLinks, accessGrants, screeningResults] = await Promise.all([
    listShipmentFiles(id),
    listShareLinks(id),
    listShipmentAccess(id),
    listScreeningResults(shipment.org_id),
  ]);
  const shipmentScreening = screeningResults.filter(
    (result) => result.shipment_id === shipment.id,
  );
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const total = shipment.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_value,
    0,
  );
  const totalQuantity = shipment.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const facts = [
    { label: "Channel", value: titleCase(shipment.channel) },
    { label: "Route", value: `${shipment.origin_country} → ${shipment.destination_country}` },
    { label: "Mode", value: titleCase(shipment.mode) },
    {
      label: "Incoterm",
      value:
        [shipment.incoterm, shipment.incotermName]
          .filter(Boolean)
          .join(" - ") || "Not set",
    },
    { label: "Incoterm place", value: shipment.incoterm_place ?? "Not set" },
    { label: "Currency", value: shipment.currency },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="shipments" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <Link
          href="/dashboard/shipments"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          ← Back to shipments
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-semibold tracking-tight text-deep-harbor">
                {shipment.reference ?? shipment.id.slice(0, 8)}
              </h1>
              <StatusBadge status={shipment.status} />
              <ChannelBadge channel={shipment.channel} />
            </div>
            <p className="mt-2 text-muted">{shipment.organization.name}</p>
            <Link
              href={`/dashboard/shipments/${shipment.id}/edit`}
              className="mt-3 inline-flex rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
            >
              Edit shipment
            </Link>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Total value
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-deep-harbor">
              {formatMoney(total, shipment.currency)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Shipment facts
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-medium uppercase tracking-widest text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ConsistencyFindings shipmentId={shipment.id} findings={findings} />

        <ScreeningCard
          shipmentId={shipment.id}
          initialResults={shipmentScreening}
        />

        <section className="mt-8 overflow-hidden rounded-xl border border-hairline bg-white">
          <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Items
            </h2>
            <span className="font-mono text-xs text-muted">
              {shipment.items.length} line
              {shipment.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">HS code</th>
                  <th className="px-6 py-3 text-right font-medium">Qty</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 text-right font-medium">
                    Unit value
                  </th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                  <th className="px-6 py-3 text-right font-medium">Net / Gross</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-6 py-4 text-ink">{item.description}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink">
                      {item.hs_code ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.quantity, 3)}
                    </td>
                    <td className="px-6 py-4 text-ink">{item.unit}</td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.unit_value, 2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ink">
                      {formatNumber(item.quantity * item.unit_value, 2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-muted">
                      {item.net_weight_kg === null
                        ? "-"
                        : formatNumber(item.net_weight_kg, 3)}{" "}
                      /{" "}
                      {item.gross_weight_kg === null
                        ? "-"
                        : formatNumber(item.gross_weight_kg, 3)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cloud">
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-sm font-medium text-ink"
                  >
                    Totals
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-medium text-ink">
                    {formatNumber(totalQuantity, 3)}
                  </td>
                  <td />
                  <td />
                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-deep-harbor">
                    {formatMoney(total, shipment.currency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Documents required
          </h2>
          <p className="mt-2 text-sm text-muted">
            Based on the {shipment.channel} corridor {shipment.origin_country} to{" "}
            {shipment.destination_country} and the HS codes on this shipment.
          </p>
          <div className="mt-5">
            <RequiredDocumentsList documents={requiredDocuments} />
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Documents
          </h2>
          <p className="mt-2 text-sm text-muted">
            Generate a document from this shipment record. It opens in a new
            tab and is logged against the shipment.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {documents.map((document) => (
              <a
                key={document.type}
                href={`/api/shipments/${shipment.id}/documents/${document.type}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
              >
                {document.label}
              </a>
            ))}
          </div>
          <a
            href={`/api/shipments/${shipment.id}/documents/set`}
            className="mt-4 inline-flex rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Download document set
          </a>
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Attachments
          </h2>
          <p className="mt-2 text-sm text-muted">
            Upload supporting files such as packing photos, permits or scanned
            certificates. Files are private to your organization.
          </p>

          <form
            action={uploadShipmentFileAction}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="shipmentId" value={shipment.id} />
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
              className="text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-cloud file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:border-signal-teal"
            />
            <button
              type="submit"
              className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
            >
              Upload
            </button>
          </form>

          {files.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No files uploaded yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-hairline">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="font-mono text-xs text-ink">
                    {file.fileUrl.split("/").pop()}
                  </span>
                  <span className="flex items-center gap-3">
                    {file.signedUrl ? (
                      <a
                        href={file.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-signal-teal hover:underline"
                      >
                        Download
                      </a>
                    ) : null}
                    <form action={deleteShipmentFileAction}>
                      <input
                        type="hidden"
                        name="shipmentId"
                        value={shipment.id}
                      />
                      <input type="hidden" name="fileId" value={file.id} />
                      <button
                        type="submit"
                        className="text-sm font-medium text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Share
          </h2>
          <p className="mt-2 text-sm text-muted">
            Create a read-only link so a partner or agent can download the
            document set without signing in.
          </p>

          <form
            action={createShareLinkAction}
            className="mt-5 flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="shipmentId" value={shipment.id} />
            <label className="text-sm font-medium text-ink">
              Expires in days
              <input
                type="number"
                name="days"
                min={1}
                max={365}
                defaultValue={7}
                className="mt-1 block w-32 rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
              />
            </label>
            <button
              type="submit"
              className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
            >
              Create link
            </button>
          </form>

          {shareLinks.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No share links yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-hairline">
              {shareLinks.map((link) => (
                <li
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0">
                    <a
                      href={`${appUrl}/share/${link.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate font-mono text-xs text-signal-teal hover:underline"
                    >
                      {appUrl}/share/{link.token}
                    </a>
                    <span className="text-xs text-muted">
                      Expires{" "}
                      {new Date(link.expiresAt).toISOString().slice(0, 10)}
                    </span>
                  </span>
                  <form action={revokeShareLinkAction}>
                    <input type="hidden" name="shipmentId" value={shipment.id} />
                    <input type="hidden" name="linkId" value={link.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-danger hover:underline"
                    >
                      Revoke
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Access
          </h2>
          <p className="mt-2 text-sm text-muted">
            Grant another organization read access to this shipment.
          </p>

          <form
            action={grantShipmentAccessAction}
            className="mt-5 flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="shipmentId" value={shipment.id} />
            <label className="text-sm font-medium text-ink">
              Organization ID
              <input
                type="text"
                name="orgId"
                required
                placeholder="00000000-0000-0000-0000-000000000000"
                className="mt-1 block w-80 rounded-md border border-hairline bg-white px-3 py-2 font-mono text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
              />
            </label>
            <button
              type="submit"
              className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-signal-teal hover:text-signal-teal"
            >
              Grant access
            </button>
          </form>

          {accessGrants.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No organizations granted access.</p>
          ) : (
            <ul className="mt-5 divide-y divide-hairline">
              {accessGrants.map((grant) => (
                <li
                  key={grant.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="font-mono text-xs text-ink">
                    {grant.orgId}
                    <span className="ml-3 font-sans text-xs text-muted">
                      granted{" "}
                      {new Date(grant.createdAt).toISOString().slice(0, 10)}
                    </span>
                  </span>
                  <form action={revokeShipmentAccessAction}>
                    <input type="hidden" name="shipmentId" value={shipment.id} />
                    <input type="hidden" name="accessId" value={grant.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-danger hover:underline"
                    >
                      Revoke
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
