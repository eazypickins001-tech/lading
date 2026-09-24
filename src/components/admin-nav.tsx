"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/data", label: "Data sources" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            isActive(link.href) ? "text-white" : "text-white/70 hover:text-white"
          }
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/dashboard"
        className="rounded-md border border-white/20 px-3 py-1.5 text-white hover:bg-white/5"
      >
        Back to app
      </Link>
    </nav>
  );
}
