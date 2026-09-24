import type { ConsistencyFinding, FindingSeverity } from "@/lib/consistency";
import { createClient } from "@/lib/supabase/server";

export type StoredFinding = ConsistencyFinding & {
  id: string;
  resolved: boolean;
  created_at: string;
};

type FindingRow = {
  id: string;
  code: string | null;
  severity: FindingSeverity;
  field: string | null;
  docs_involved: string[] | null;
  message: string;
  resolved: boolean;
  created_at: string;
};

function toStored(row: FindingRow): StoredFinding {
  return {
    id: row.id,
    code: row.code ?? "unknown",
    severity: row.severity,
    field: row.field,
    docsInvolved: row.docs_involved ?? [],
    message: row.message,
    resolved: row.resolved,
    created_at: row.created_at,
  };
}

export async function listFindings(
  shipmentId: string,
): Promise<StoredFinding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consistency_findings")
    .select(
      "id, code, severity, field, docs_involved, message, resolved, created_at",
    )
    .eq("shipment_id", shipmentId)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as FindingRow[]).map(toStored);
}

export async function replaceFindings(
  shipmentId: string,
  findings: ConsistencyFinding[],
): Promise<number> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("consistency_findings")
    .delete()
    .eq("shipment_id", shipmentId);

  if (deleteError) {
    throw new Error("Could not clear existing consistency findings.");
  }

  if (findings.length === 0) {
    return 0;
  }

  const rows = findings.map((finding) => ({
    shipment_id: shipmentId,
    code: finding.code,
    severity: finding.severity,
    field: finding.field,
    docs_involved: finding.docsInvolved,
    message: finding.message,
  }));

  const { error: insertError } = await supabase
    .from("consistency_findings")
    .insert(rows);

  if (insertError) {
    throw new Error("Could not save consistency findings.");
  }

  return rows.length;
}

export async function setFindingResolved(
  findingId: string,
  resolved: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("consistency_findings")
    .update({ resolved })
    .eq("id", findingId);

  if (error) {
    throw new Error("Could not update the finding.");
  }
}
