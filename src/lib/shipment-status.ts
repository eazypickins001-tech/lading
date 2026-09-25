import type { ShipmentStatus } from "@/lib/documents/types";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "draft",
  "documents_pending",
  "ready",
  "submitted",
  "cleared",
  "closed",
  "cancelled",
];

export const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["documents_pending", "ready", "cancelled"],
  documents_pending: ["draft", "ready", "cancelled"],
  ready: ["documents_pending", "submitted", "cancelled"],
  submitted: ["ready", "cleared"],
  cleared: ["closed"],
  closed: [],
  cancelled: [],
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: "Draft",
  documents_pending: "Documents pending",
  ready: "Ready",
  submitted: "Submitted",
  cleared: "Cleared",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function canTransition(
  from: ShipmentStatus,
  to: ShipmentStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function statusLabel(status: ShipmentStatus): string {
  return STATUS_LABELS[status];
}
