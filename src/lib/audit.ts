import { createClient } from "@/lib/supabase/server";

export type AuditEventInput = {
  orgId: string | null;
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("audit_events").insert({
      org_id: input.orgId,
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    return;
  }
}
