type LogoVariant = "onLight" | "onDark";

const PALETTE: Record<LogoVariant, { ring: string; accent: string; mark: string }> = {
  onLight: { ring: "#0B1F33", accent: "#0E9F8E", mark: "#0E9F8E" },
  onDark: { ring: "#6FD0C6", accent: "#A7E3DC", mark: "#FFFFFF" },
};

export function LadingMark({
  variant = "onLight",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const colors = PALETTE[variant];
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Lading"
      fill="none"
    >
      <path
        d="M55.56 21.01 A26 26 0 1 1 34.27 6.1"
        stroke={colors.ring}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <path
        d="M40.89 7.57 A26 26 0 0 1 53.3 17.08"
        stroke={colors.accent}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <path
        d="M22 23 V42 H41"
        stroke={colors.mark}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 33 L32 39 L45 24"
        stroke={colors.mark}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LadingLogo({
  variant = "onLight",
  className,
  markClassName,
  wordmarkClassName,
}: {
  variant?: LogoVariant;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  const defaultWordmark = variant === "onDark" ? "text-white" : "text-deep-harbor";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LadingMark variant={variant} className={markClassName ?? "h-8 w-8"} />
      <span
        className={`text-lg font-semibold tracking-[0.2em] ${wordmarkClassName ?? defaultWordmark}`}
      >
        LADING
      </span>
    </span>
  );
}
