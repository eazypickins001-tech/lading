import { createClient } from "@/lib/supabase/server";

export type Notification = {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type CreateNotificationInput = {
  orgId: string;
  userId: string | null;
  title: string;
  body?: string | null;
  link?: string | null;
};

type NotificationRow = {
  id: string;
  org_id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  if (!input.userId) {
    return;
  }

  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      org_id: input.orgId,
      user_id: input.userId,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    });
  } catch {
    return;
  }
}

export async function listNotifications(
  limit = 10,
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, org_id, user_id, title, body, link, read, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as NotificationRow[]).map(toNotification);
}

export async function unreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function markAllRead(): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("read", false);
}
