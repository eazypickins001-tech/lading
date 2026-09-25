import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { LadingLogo } from "@/components/lading-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-6 text-sm text-muted md:flex-row md:items-center">
          <LadingLogo variant="onLight" />
          <span>Trade documentation &amp; compliance for African markets.</span>
          <div className="flex flex-wrap gap-6">
            <Link href="/blog" className="hover:text-ink">
              Blog
            </Link>
            <Link href="/resources" className="hover:text-ink">
              Resources
            </Link>
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-hairline pt-6">
          <Disclaimer />
        </div>
      </div>
    </footer>
  );
}
