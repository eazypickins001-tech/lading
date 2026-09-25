"use client";

import { useFormStatus } from "react-dom";
import type { ShipmentStatus } from "@/lib/documents/types";
import { ALLOWED_TRANSITIONS, statusLabel } from "@/lib/shipment-status";
import { updateShipmentStatusAction } from "../actions";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:border-signal-teal hover:text-signal-teal disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export function StatusControl({
  shipmentId,
  status,
}: {
  shipmentId: string;
  status: ShipmentStatus;
}) {
  const nextStatuses = ALLOWED_TRANSITIONS[status];

  if (nextStatuses.length === 0) {
    return (
      <span className="rounded-full border border-hairline bg-cloud px-2.5 py-0.5 text-xs font-medium text-muted">
        {statusLabel(status)}
      </span>
    );
  }

  return (
    <form action={updateShipmentStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <label className="sr-only" htmlFor={`status-${shipmentId}`}>
        Update shipment status
      </label>
      <select
        id={`status-${shipmentId}`}
        name="status"
        defaultValue={nextStatuses[0]}
        className="rounded-md border border-hairline bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal"
      >
        {nextStatuses.map((next) => (
          <option key={next} value={next}>
            {statusLabel(next)}
          </option>
        ))}
      </select>
      <SaveButton />
    </form>
  );
}
