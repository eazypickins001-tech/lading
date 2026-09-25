import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "../post-form";

export const metadata: Metadata = {
  title: "New post",
};

export default function NewBlogPostPage() {
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
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">New post</h1>
      </div>

      <div className="mt-8 max-w-3xl">
        <PostForm />
      </div>
    </div>
  );
}
