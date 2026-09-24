import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";

export function DashboardHeader({
  active,
}: {
  active: "dashboard" | "shipments";
}) {
  const linkClass = (isActive: boolean) =>
    isActive ? "text-white" : "text-white/70 hover:text-white";

  return (
    <header className="border-b border-hairline bg-deep-harbor text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-[0.2em]"
          >
            LADING
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/dashboard"
              className={linkClass(active === "dashboard")}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/shipments"
              className={linkClass(active === "shipments")}
            >
              Shipments
            </Link>
          </nav>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
