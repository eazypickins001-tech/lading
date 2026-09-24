import type { ShipmentStatus, TradeChannel } from "@/lib/documents/types";

const statusStyles: Record<ShipmentStatus, string> = {
  draft: "bg-cloud text-muted border border-hairline",
  documents_pending: "bg-signal-teal/10 text-deep-harbor",
  ready: "bg-signal-teal/10 text-deep-harbor",
  submitted: "bg-manifest-amber/15 text-ink",
  cleared: "bg-success/10 text-[#166534]",
  closed: "bg-cloud text-muted border border-hairline",
  cancelled: "bg-danger/10 text-[#991B1B]",
};

const statusLabels: Record<ShipmentStatus, string> = {
  draft: "Draft",
  documents_pending: "Documents",
  ready: "Ready",
  submitted: "Submitted",
  cleared: "Cleared",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: TradeChannel }) {
  const styles =
    channel === "import"
      ? "bg-harbor-navy/10 text-harbor-navy"
      : "bg-signal-teal/10 text-deep-harbor";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {channel}
    </span>
  );
}
