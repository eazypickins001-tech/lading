import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type ShareLink = {
  id: string;
  token: string;
  shipmentId: string;
  expiresAt: string;
  createdAt: string;
};

export type PublicShareLink = ShareLink & { orgId: string };

type ShareLinkRow = {
  id: string;
  token: string;
  shipment_id: string;
  org_id: string;
  expires_at: string;
  created_at: string;
};

const SHARE_LINK_COLUMNS =
  "id, token, shipment_id, org_id, expires_at, created_at";

function toShareLink(row: ShareLinkRow): ShareLink {
  return {
    id: row.id,
    token: row.token,
    shipmentId: row.shipment_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function listShareLinks(
  shipmentId: string,
): Promise<ShareLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("share_links")
    .select(SHARE_LINK_COLUMNS)
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ShareLinkRow[]).map(toShareLink);
}

export async function createShareLink(
  shipmentId: string,
  orgId: string,
  userId: string,
  days: number,
): Promise<ShareLink> {
  const supabase = await createClient();
  const expiresAt = new Date(
    Date.now() + Math.max(1, days) * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      shipment_id: shipmentId,
      org_id: orgId,
      created_by: userId,
      expires_at: expiresAt,
    })
    .select(SHARE_LINK_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error("Could not create the share link.");
  }

  return toShareLink(data as ShareLinkRow);
}

export async function revokeShareLink(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("share_links").delete().eq("id", id);
}

export async function getShareLinkByToken(
  token: string,
  client?: SupabaseClient,
): Promise<PublicShareLink | null> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("share_links")
    .select(SHARE_LINK_COLUMNS)
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ShareLinkRow;

  return { ...toShareLink(row), orgId: row.org_id };
}
