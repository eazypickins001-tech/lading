"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  | "api"
  | "blog";

type NavItem = { key: NavKey; href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const entries: NavEntry[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "shipments", href: "/dashboard/shipments", label: "Shipments" },
  {
    label: "Trade tools",
    items: [
      { key: "requirements", href: "/dashboard/requirements", label: "Requirements" },
      { key: "screening", href: "/dashboard/screening", label: "Screening" },
      { key: "landedCost", href: "/dashboard/landed-cost", label: "Landed cost" },
      { key: "tradeTerms", href: "/dashboard/trade-terms", label: "Trade terms" },
    ],
  },
  {
    label: "Directory",
    items: [
      { key: "parties", href: "/dashboard/parties", label: "Contacts" },
      { key: "products", href: "/dashboard/products", label: "Products" },
    ],
  },
  {
    label: "Insights",
    items: [
      { key: "reports", href: "/dashboard/reports", label: "Reports" },
      { key: "audit", href: "/dashboard/audit", label: "Audit trail" },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "profile", href: "/dashboard/profile", label: "Profile" },
      { key: "billing", href: "/dashboard/billing", label: "Billing" },
      { key: "api", href: "/dashboard/api", label: "API" },
      { key: "settings", href: "/dashboard/settings", label: "Settings" },
      { key: "blog", href: "/blog", label: "Blog" },
    ],
  },
];

export function DashboardNav({ active }: { active: NavKey }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const node = navRef.current;
      if (!node) {
        return;
      }
      if (!node.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const groupIsActive = (group: NavGroup) =>
    group.items.some((item) => item.key === active);

  return (
    <>
      <div ref={navRef} className="hidden items-center gap-1 text-sm md:flex">
        {entries.map((entry) => {
          if (!isGroup(entry)) {
            return (
              <Link
                key={entry.key}
                href={entry.href}
                className={`rounded-md px-3 py-2 ${
                  active === entry.key
                    ? "text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {entry.label}
              </Link>
            );
          }

          const isOpen = openGroup === entry.label;
          const isActive = groupIsActive(entry);

          return (
            <div
              key={entry.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(entry.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenGroup((current) =>
                    current === entry.label ? null : entry.label,
                  )
                }
                className={`flex items-center gap-1 rounded-md px-3 py-2 ${
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {entry.label}
                <svg
                  viewBox="0 0 24 24"
                  className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isOpen ? (
                <div className="absolute left-0 top-full z-40 min-w-48 rounded-lg border border-hairline bg-white py-1 shadow-lg">
                  {entry.items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setOpenGroup(null)}
                      className={`block px-4 py-2 text-sm ${
                        active === item.key
                          ? "bg-cloud font-medium text-deep-harbor"
                          : "text-ink hover:bg-cloud"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/shipments/new"
          className="rounded-md bg-signal-teal px-4 py-2 text-sm font-medium text-white hover:bg-signal-teal/90"
        >
          New shipment
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
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
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <nav
          id="dashboard-mobile-nav"
          className="absolute inset-x-0 top-full z-30 max-h-[70vh] overflow-y-auto border-b border-hairline bg-deep-harbor px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-5 text-sm">
            {entries.map((entry) => {
              if (!isGroup(entry)) {
                return (
                  <Link
                    key={entry.key}
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      active === entry.key ? "text-white" : "text-white/70"
                    }
                  >
                    {entry.label}
                  </Link>
                );
              }
              return (
                <div key={entry.label} className="flex flex-col gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                    {entry.label}
                  </span>
                  {entry.items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={
                        active === item.key ? "text-white" : "text-white/70"
                      }
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
