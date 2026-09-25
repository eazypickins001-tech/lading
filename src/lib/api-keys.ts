import { createHash, randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type GeneratedApiKey = {
  plain: string;
  prefix: string;
  hash: string;
};

export type ApiKeyMetadata = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export type CreatedApiKey = {
  id: string;
  plain: string;
};

export type ApiKeyAuth = {
  orgId: string;
  keyId: string;
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

export function hashApiKey(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateApiKey(): GeneratedApiKey {
  const plain = `ldg_${randomBytes(16).toString("hex")}`;
  return {
    plain,
    prefix: plain.slice(0, 12),
    hash: hashApiKey(plain),
  };
}

export async function createApiKey(
  orgId: string,
  name: string,
): Promise<CreatedApiKey> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const generated = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      org_id: orgId,
      name,
      key_prefix: generated.prefix,
      key_hash: generated.hash,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create the API key.");
  }

  return { id: (data as { id: string }).id, plain: generated.plain };
}

export async function listApiKeys(): Promise<ApiKeyMetadata[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, created_at, revoked_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ApiKeyRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  }));
}

export async function revokeApiKey(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
}

export async function authenticateApiKey(
  request: Request,
): Promise<ApiKeyAuth | null> {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const plain = match?.[1]?.trim();
  if (!plain) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .select("id, org_id")
    .eq("key_hash", hashApiKey(plain))
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as { id: string; org_id: string };

  await admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);

  return { orgId: row.org_id, keyId: row.id };
}
