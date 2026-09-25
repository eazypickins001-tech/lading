import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCover } from "@/components/blog-cover";
import { Disclaimer } from "@/components/disclaimer";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import {
  PLATFORM_LABELS,
  PLATFORM_ORDER,
  coverImageUrl,
  youtubeId,
} from "@/lib/blog";
import { getPublishedPost } from "@/lib/blog-store";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) {
    notFound();
  }

  const videoId = post.youtubeUrl ? youtubeId(post.youtubeUrl) : null;

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/blog" className="text-sm text-muted hover:text-ink">
          Back to blog
        </Link>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cloud px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-deep-harbor">
          {post.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {formatDate(post.publishedAt)}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink">
          {post.description}
        </p>

        <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl border border-hairline">
          <BlogCover
            src={coverImageUrl(post)}
            alt={post.title}
            title={post.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-hairline bg-deep-harbor">
          {videoId ? (
            <div className="aspect-[9/16] w-full max-w-sm mx-auto">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-[9/16] w-full max-w-sm mx-auto flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-white">
                Video coming soon
              </p>
              <p className="mt-2 text-xs text-white/60">
                Follow us on your favourite platform to catch it first.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
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
                className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink hover:border-signal-teal hover:text-signal-teal"
              >
                Watch on {PLATFORM_LABELS[platform]}
              </a>
            );
          })}
        </div>

        <div className="mt-10 space-y-4 text-base leading-relaxed text-ink">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-hairline bg-cloud p-6">
          <h2 className="text-lg font-semibold text-deep-harbor">
            Check your own shipment
          </h2>
          <p className="mt-2 text-sm text-muted">
            Lading generates your documents, checks them for consistency,
            screens your parties and tells you which permits apply, all from one
            shipment record.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex rounded-md bg-signal-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Start free
          </Link>
        </div>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
