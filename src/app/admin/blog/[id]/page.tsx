import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getPostById } from "@/lib/blog-store";
import { PostForm } from "../post-form";

export const metadata: Metadata = {
  title: "Edit post",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/blog"
        className="text-sm font-medium text-muted hover:text-ink"
      >
        ← Back to blog
      </Link>

      <div className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {post.title}
        </h1>
      </div>

      <div className="mt-8 max-w-3xl">
        <PostForm post={post} />
      </div>
    </div>
  );
}
