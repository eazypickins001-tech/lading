import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type OrgType = "trader" | "agent" | "both";
export type OrgRole = "owner" | "admin" | "trader" | "agent" | "viewer";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  plan: string;
  role: OrgRole;
};

type OrganizationRecord = {
  id: string;
  name: string;
  type: OrgType;
  plan: string;
};

type MembershipRow = {
  role: OrgRole;
  organizations: OrganizationRecord | OrganizationRecord[] | null;
};

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserOrganizations(): Promise<Organization[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, organizations (id, name, type, plan)");

  if (error || !data) {
    return [];
  }

  return (data as MembershipRow[]).flatMap((row) => {
    const organization = Array.isArray(row.organizations)
      ? row.organizations[0]
      : row.organizations;
    return organization ? [{ ...organization, role: row.role }] : [];
  });
}

export async function getActiveOrg(): Promise<Organization | null> {
  const organizations = await getUserOrganizations();
  return organizations[0] ?? null;
}
