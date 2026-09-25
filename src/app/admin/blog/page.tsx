import type { Metadata } from "next";
import Link from "next/link";
import { listAllPosts } from "@/lib/blog-store";
import { deletePostAction, togglePublishAction } from "./actions";

export const metadata: Metadata = {
  title: "Blog",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateOrDash(value: string): string {
  return value ? formatDate(value) : "-";
}

export default async function AdminBlogPage() {
  const posts = await listAllPosts();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Write, publish and unpublish the posts shown on the public blog.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-white p-10 text-center text-sm text-muted">
          No posts yet.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-hairline bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Published</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-hairline last:border-0 hover:bg-cloud"
                >
                  <td className="px-5 py-4 font-medium text-deep-harbor">
                    {post.title}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {post.slug}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        post.published
                          ? "rounded-full border border-success/30 bg-success/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success"
                          : "rounded-full border border-hairline bg-cloud px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDateOrDash(post.publishedAt)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-signal-teal hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={togglePublishAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="slug" value={post.slug} />
                        <input
                          type="hidden"
                          name="published"
                          value={post.published ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="font-medium text-ink hover:underline"
                        >
                          {post.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="slug" value={post.slug} />
                        <button
                          type="submit"
                          className="font-medium text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
