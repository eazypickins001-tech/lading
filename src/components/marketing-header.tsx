import Link from "next/link";
import { LadingLogo } from "@/components/lading-logo";

export function MarketingHeader() {
  return (
    <header className="border-b border-hairline bg-deep-harbor text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Lading home" className="inline-flex">
          <LadingLogo variant="onDark" />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          <Link href="/#modules" className="hover:text-white">
            Platform
          </Link>
          <Link href="/#trade" className="hover:text-white">
            Import &amp; Export
          </Link>
          <Link href="/#data" className="hover:text-white">
            Data
          </Link>
          <Link href="/resources" className="hover:text-white">
            Resources
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
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
        </div>
      </nav>
    </header>
  );
}
