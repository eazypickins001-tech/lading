"use client";

import Link from "next/link";
import { useState } from "react";
import { LadingLogo } from "@/components/lading-logo";

const links = [
  { href: "/#modules", label: "Platform" },
  { href: "/#trade", label: "Import & Export" },
  { href: "/#data", label: "Data" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-hairline bg-deep-harbor text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Lading home" className="inline-flex">
          <LadingLogo variant="onDark" />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="text-white/80 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-signal-teal px-4 py-2 font-medium text-white hover:bg-signal-teal/90"
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label="Toggle navigation"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5 lg:hidden"
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
      </nav>

      {open ? (
        <nav
          id="marketing-mobile-nav"
          className="border-t border-white/10 lg:hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
