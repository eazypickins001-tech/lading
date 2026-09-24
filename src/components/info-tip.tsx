"use client";

import { useId, type ReactNode } from "react";

export function InfoTip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const id = useId();
  const position = side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";

  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-hairline bg-cloud font-mono text-[10px] font-semibold text-muted hover:border-signal-teal hover:text-signal-teal focus:outline-none focus-visible:ring-1 focus-visible:ring-signal-teal"
      >
        ?
      </button>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-20 w-56 -translate-x-1/2 rounded-md bg-deep-harbor px-3 py-2 text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${position}`}
      >
        {children}
      </span>
    </span>
  );
}
