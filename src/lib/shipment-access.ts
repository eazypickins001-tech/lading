import { createClient } from "@/lib/supabase/server";

export type ShipmentAccessGrant = {
  id: string;
  orgId: string;
  grantedBy: string | null;
  createdAt: string;
};

type ShipmentAccessRow = {
  id: string;
  org_id: string;
  granted_by: string | null;
  created_at: string;
};

export async function listShipmentAccess(
  shipmentId: string,
): Promise<ShipmentAccessGrant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipment_access")
    .select("id, org_id, granted_by, created_at")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ShipmentAccessRow[]).map((row) => ({
    id: row.id,
    orgId: row.org_id,
    grantedBy: row.granted_by,
    createdAt: row.created_at,
  }));
}

export async function grantShipmentAccess(
  shipmentId: string,
  orgId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shipment_access").insert({
    shipment_id: shipmentId,
    org_id: orgId,
    granted_by: userId,
  });

  if (error) {
    throw new Error("Could not grant access to this organization.");
  }
}

export async function revokeShipmentAccess(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("shipment_access").delete().eq("id", id);
}
