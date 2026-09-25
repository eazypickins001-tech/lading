import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Disclaimer } from "@/components/disclaimer";
import { LadingLogo } from "@/components/lading-logo";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-deep-harbor text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Lading admin">
              <LadingLogo variant="onDark" />
            </Link>
            <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white/80">
              Admin
            </span>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-hairline bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <Disclaimer />
        </div>
      </footer>
    </div>
  );
}
