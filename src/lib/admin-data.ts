import { createAdminClient } from "@/lib/supabase/admin";

export type AdminOverviewOrganization = {
  name: string;
  plan: string;
  createdAt: string;
};

export type AdminOverviewUser = {
  email: string;
  fullName: string | null;
  createdAt: string;
};

export type AdminOverview = {
  userCount: number;
  orgCount: number;
  shipmentCount: number;
  documentCount: number;
  activeSubscriptionCount: number;
  recentOrganizations: AdminOverviewOrganization[];
  recentUsers: AdminOverviewUser[];
};

export type AdminUserOrganization = {
  name: string;
  role: string;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  country: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  organizations: AdminUserOrganization[];
};

export type AdminOrganization = {
  id: string;
  name: string;
  type: string;
  plan: string;
  country: string | null;
  createdAt: string;
  memberCount: number;
  shipmentCount: number;
};

export type AdminSubscription = {
  id: string;
  orgName: string;
  plan: string;
  status: string;
  provider: string | null;
  periodEnd: string | null;
  createdAt: string;
};

export type AdminUserProfile = {
  fullName: string | null;
  phone: string | null;
  country: string | null;
};

export type AdminUserDetailOrganization = {
  id: string;
  name: string;
  type: string;
  plan: string;
  role: string;
};

export type AdminUserDetail = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  profile: AdminUserProfile | null;
  organizations: AdminUserDetailOrganization[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();

  const [
    usersResult,
    orgCountResult,
    shipmentCountResult,
    documentCountResult,
    subscriptionCountResult,
    recentOrgResult,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 100 }),
    admin.from("organizations").select("id", { count: "exact", head: true }),
    admin.from("shipments").select("id", { count: "exact", head: true }),
    admin
      .from("shipment_documents")
      .select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("organizations")
      .select("name, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const users = usersResult.data?.users ?? [];
  const userCount =
    usersResult.data && "total" in usersResult.data
      ? usersResult.data.total
      : 0;

  const recentUsersRaw = [...users]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 5);
  const recentUserIds = recentUsersRaw.map((user) => user.id);

  const profileMap = new Map<string, string | null>();
  if (recentUserIds.length > 0) {
    const { data } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", recentUserIds);

    for (const profile of (data ?? []) as {
      id: string;
      full_name: string | null;
    }[]) {
      profileMap.set(profile.id, profile.full_name);
    }
  }

  const recentOrganizations = (
    (recentOrgResult.data ?? []) as {
      name: string;
      plan: string;
      created_at: string;
    }[]
  ).map((organization) => ({
    name: organization.name,
    plan: organization.plan,
    createdAt: organization.created_at,
  }));

  return {
    userCount,
    orgCount: orgCountResult.count ?? 0,
    shipmentCount: shipmentCountResult.count ?? 0,
    documentCount: documentCountResult.count ?? 0,
    activeSubscriptionCount: subscriptionCountResult.count ?? 0,
    recentOrganizations,
    recentUsers: recentUsersRaw.map((user) => ({
      email: user.email ?? "",
      fullName: profileMap.get(user.id) ?? null,
      createdAt: user.created_at,
    })),
  };
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();

  const usersResult = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });
  const users = usersResult.data?.users ?? [];

  if (users.length === 0) {
    return [];
  }

  const ids = users.map((user) => user.id);

  const [profileResult, membershipResult, orgResult] = await Promise.all([
    admin.from("profiles").select("id, full_name, country").in("id", ids),
    admin.from("memberships").select("user_id, role, org_id").in("user_id", ids),
    admin.from("organizations").select("id, name"),
  ]);

  const profiles = (profileResult.data ?? []) as {
    id: string;
    full_name: string | null;
    country: string | null;
  }[];
  const memberships = (membershipResult.data ?? []) as {
    user_id: string;
    role: string;
    org_id: string;
  }[];
  const organizations = (orgResult.data ?? []) as {
    id: string;
    name: string;
  }[];

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );
  const orgMap = new Map(
    organizations.map((organization) => [organization.id, organization.name]),
  );
  const membershipsByUser = new Map<string, AdminUserOrganization[]>();

  for (const membership of memberships) {
    const list = membershipsByUser.get(membership.user_id) ?? [];
    list.push({
      name: orgMap.get(membership.org_id) ?? "Unknown organization",
      role: membership.role,
    });
    membershipsByUser.set(membership.user_id, list);
  }

  return users.map((user) => ({
    id: user.id,
    email: user.email ?? "",
    fullName: profileMap.get(user.id)?.full_name ?? null,
    country: profileMap.get(user.id)?.country ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    organizations: membershipsByUser.get(user.id) ?? [],
  }));
}

export async function listAdminOrganizations(): Promise<AdminOrganization[]> {
  const admin = createAdminClient();

  const [orgResult, membershipResult, shipmentResult] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, type, plan, country, created_at")
      .order("created_at", { ascending: false }),
    admin.from("memberships").select("org_id"),
    admin.from("shipments").select("org_id"),
  ]);

  const organizations = (orgResult.data ?? []) as {
    id: string;
    name: string;
    type: string;
    plan: string;
    country: string | null;
    created_at: string;
  }[];
  const memberships = (membershipResult.data ?? []) as { org_id: string }[];
  const shipments = (shipmentResult.data ?? []) as { org_id: string }[];

  const memberCounts = new Map<string, number>();
  for (const membership of memberships) {
    memberCounts.set(
      membership.org_id,
      (memberCounts.get(membership.org_id) ?? 0) + 1,
    );
  }

  const shipmentCounts = new Map<string, number>();
  for (const shipment of shipments) {
    shipmentCounts.set(
      shipment.org_id,
      (shipmentCounts.get(shipment.org_id) ?? 0) + 1,
    );
  }

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    type: organization.type,
    plan: organization.plan,
    country: organization.country,
    createdAt: organization.created_at,
    memberCount: memberCounts.get(organization.id) ?? 0,
    shipmentCount: shipmentCounts.get(organization.id) ?? 0,
  }));
}

export async function listAdminSubscriptions(): Promise<AdminSubscription[]> {
  const admin = createAdminClient();

  const [subResult, orgResult] = await Promise.all([
    admin
      .from("subscriptions")
      .select("id, org_id, plan, status, provider, period_end, created_at")
      .order("created_at", { ascending: false }),
    admin.from("organizations").select("id, name"),
  ]);

  const subscriptions = (subResult.data ?? []) as {
    id: string;
    org_id: string;
    plan: string;
    status: string;
    provider: string | null;
    period_end: string | null;
    created_at: string;
  }[];
  const organizations = (orgResult.data ?? []) as {
    id: string;
    name: string;
  }[];
  const orgMap = new Map(
    organizations.map((organization) => [organization.id, organization.name]),
  );

  return subscriptions.map((subscription) => ({
    id: subscription.id,
    orgName: orgMap.get(subscription.org_id) ?? "Unknown organization",
    plan: subscription.plan,
    status: subscription.status,
    provider: subscription.provider,
    periodEnd: subscription.period_end,
    createdAt: subscription.created_at,
  }));
}

export async function getAdminUser(
  id: string,
): Promise<AdminUserDetail | null> {
  const admin = createAdminClient();

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(id);

  if (userError || !userData) {
    return null;
  }

  const user = userData.user;

  const [profileResult, membershipResult] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name, phone, country")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("memberships")
      .select("role, organizations (id, name, type, plan)")
      .eq("user_id", id),
  ]);

  const profileRow = (profileResult.data ?? null) as {
    full_name: string | null;
    phone: string | null;
    country: string | null;
  } | null;

  const memberships = (membershipResult.data ?? []) as {
    role: string;
    organizations:
      | { id: string; name: string; type: string; plan: string }
      | { id: string; name: string; type: string; plan: string }[]
      | null;
  }[];

  const organizations = memberships.flatMap((membership) => {
    const organization = Array.isArray(membership.organizations)
      ? membership.organizations[0]
      : membership.organizations;

    return organization
      ? [
          {
            id: organization.id,
            name: organization.name,
            type: organization.type,
            plan: organization.plan,
            role: membership.role,
          },
        ]
      : [];
  });

  return {
    id: user.id,
    email: user.email ?? "",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    profile: profileRow
      ? {
          fullName: profileRow.full_name,
          phone: profileRow.phone,
          country: profileRow.country,
        }
      : null,
    organizations,
  };
}
