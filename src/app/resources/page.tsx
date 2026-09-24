import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { RESOURCES } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Practical guides for Nigerian importers and exporters: import documents, Form M and PAAR, Incoterms 2020, and HS codes, explained in plain language.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function ResourcesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Resources
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep-harbor md:text-4xl">
          Guides for getting shipments right
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Plain-language explainers on the documents, declarations, terms, and
          codes that decide how smoothly your goods clear. Written for Nigerian
          importers and exporters.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {RESOURCES.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="flex flex-col rounded-xl border border-hairline bg-white p-6 transition-colors hover:border-signal-teal"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {formatDate(article.publishedAt)} · {article.readMinutes} min
                read
              </p>
              <h2 className="mt-3 text-lg font-semibold text-deep-harbor">
                {article.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {article.description}
              </p>
              <span className="mt-4 text-sm font-medium text-signal-teal">
                Read the guide
              </span>
            </Link>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
