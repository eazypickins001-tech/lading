"use client";

import Link from "next/link";
import { useState } from "react";

export type NavKey =
  | "dashboard"
  | "shipments"
  | "parties"
  | "products"
  | "requirements"
  | "screening"
  | "landedCost"
  | "tradeTerms"
  | "reports"
  | "profile"
  | "settings"
  | "audit"
  | "billing"
  | "api";

const links: { key: NavKey; href: string; label: string }[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "shipments", href: "/dashboard/shipments", label: "Shipments" },
  { key: "parties", href: "/dashboard/parties", label: "Contacts" },
  { key: "products", href: "/dashboard/products", label: "Products" },
  { key: "requirements", href: "/dashboard/requirements", label: "Requirements" },
  { key: "screening", href: "/dashboard/screening", label: "Screening" },
  { key: "landedCost", href: "/dashboard/landed-cost", label: "Landed cost" },
  { key: "tradeTerms", href: "/dashboard/trade-terms", label: "Trade terms" },
  { key: "reports", href: "/dashboard/reports", label: "Reports" },
  { key: "profile", href: "/dashboard/profile", label: "Profile" },
  { key: "settings", href: "/dashboard/settings", label: "Settings" },
  { key: "audit", href: "/dashboard/audit", label: "Audit" },
  { key: "billing", href: "/dashboard/billing", label: "Billing" },
  { key: "api", href: "/dashboard/api", label: "API" },
];

export function DashboardNav({ active }: { active: NavKey }) {
  const [open, setOpen] = useState(false);

  const linkClass = (isActive: boolean) =>
    isActive ? "text-white" : "text-white/70 hover:text-white";

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={linkClass(active === link.key)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/shipments/new"
          className="rounded-md bg-signal-teal px-4 py-2 text-sm font-medium text-white hover:bg-signal-teal/90"
        >
          New shipment
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
          aria-label="Toggle navigation"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav
          id="dashboard-mobile-nav"
          className="absolute inset-x-0 top-full z-30 border-b border-hairline bg-deep-harbor px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className={linkClass(active === link.key)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </>
  );
}
