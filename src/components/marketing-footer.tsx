import Link from "next/link";
import { LadingLogo } from "@/components/lading-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-8 text-sm text-muted md:flex-row md:items-center">
        <LadingLogo variant="onLight" />
        <span>Trade documentation &amp; compliance for African markets.</span>
        <div className="flex flex-wrap gap-6">
          <Link href="/resources" className="hover:text-ink">
            Resources
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
