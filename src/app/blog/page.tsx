import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PLATFORM_LABELS, PLATFORM_ORDER } from "@/lib/blog";
import { listPublishedPosts } from "@/lib/blog-store";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Short videos and guides on trade documentation, customs, Incoterms and compliance.",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep-harbor">
          Short videos and trade guides
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Practical, one-minute videos on import and export documentation,
          customs, Incoterms and compliance. Watch here or on your favourite
          platform.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col rounded-xl border border-hairline bg-white p-6"
            >
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-cloud px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-deep-harbor">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {post.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {PLATFORM_ORDER.map((platform) => {
                  const video = post.videos.find(
                    (entry) => entry.platform === platform,
                  );
                  if (!video) {
                    return null;
                  }
                  return (
                    <a
                      key={platform}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-hairline px-2 py-1 text-[11px] text-muted hover:border-signal-teal hover:text-signal-teal"
                    >
                      {PLATFORM_LABELS[platform]}
                    </a>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
                <span className="text-xs text-muted">
                  {formatDate(post.publishedAt)}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-signal-teal hover:underline"
                >
                  Watch
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
