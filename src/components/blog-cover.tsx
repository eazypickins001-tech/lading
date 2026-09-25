"use client";

import { useState } from "react";
import { LadingMark } from "@/components/lading-logo";

export function BlogCover({
  src,
  alt,
  title,
  className,
}: {
  src: string | null;
  alt: string;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-deep-harbor ${className ?? ""}`}
      >
        <LadingMark variant="onDark" className="h-8 w-8" />
        <span className="px-4 text-center font-mono text-[10px] uppercase tracking-widest text-white/70">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
