import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { RESOURCES, getResource } from "@/lib/resources";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RESOURCES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResource(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
    },
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const article = getResource(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          href="/resources"
          className="text-sm font-medium text-signal-teal hover:underline"
        >
          Back to resources
        </Link>

        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-deep-harbor md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
          {formatDate(article.publishedAt)} · {article.readMinutes} min read
        </p>

        <p className="mt-8 text-lg leading-relaxed text-ink">
          {article.intro}
        </p>

        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight text-deep-harbor">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-ink">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-hairline bg-cloud p-6">
          <h2 className="text-lg font-semibold text-deep-harbor">
            Key takeaways
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {article.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-2">
                <span className="text-signal-teal">✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 rounded-xl bg-deep-harbor p-6 text-white">
          <h2 className="text-lg font-semibold tracking-tight">
            Put this into practice
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Lading turns a single shipment record into a consistent document
            set, flags the permits you need, and catches mismatches before they
            reach customs.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-md bg-signal-teal px-5 py-2.5 font-medium text-white hover:bg-signal-teal/90"
          >
            Start free
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
