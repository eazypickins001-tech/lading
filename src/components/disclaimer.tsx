import Link from "next/link";

const DISCLAIMER_TEXT =
  "Lading provides trade documentation tools and information for general guidance only. It is not legal, customs, tax, or financial advice, and it is not a substitute for a licensed customs broker or the relevant authority. Classifications, duty rates, document requirements, and regulatory data may change and may not be complete or current. Always verify with the relevant customs authority or a licensed broker before shipping.";

export function Disclaimer({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <p className={`text-xs leading-relaxed text-muted ${className ?? ""}`}>
        {DISCLAIMER_TEXT}{" "}
        <Link href="/terms" className="underline hover:text-ink">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-ink">
          Privacy
        </Link>
        .
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs leading-relaxed text-muted">{DISCLAIMER_TEXT}</p>
      <p className="mt-2 text-xs text-muted">
        <Link href="/terms" className="underline hover:text-ink">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-ink">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
