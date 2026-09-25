import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { DashboardNav, type NavKey } from "@/components/dashboard-nav";
import { LadingLogo } from "@/components/lading-logo";
import { NotificationBell } from "@/components/notification-bell";
import { listNotifications, unreadCount } from "@/lib/notifications";

export async function DashboardHeader({ active }: { active: NavKey }) {
  const [notifications, unread] = await Promise.all([
    listNotifications(8),
    unreadCount(),
  ]);

  return (
    <header className="border-b border-hairline bg-deep-harbor text-white">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" aria-label="Lading dashboard">
            <LadingLogo variant="onDark" />
          </Link>
          <DashboardNav active={active} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell
            initialNotifications={notifications}
            initialUnread={unread}
          />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
