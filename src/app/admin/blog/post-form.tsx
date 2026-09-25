"use client";

import { useActionState, useState } from "react";
import type { BlogPostRecord } from "@/lib/blog";
import { PLATFORM_LABELS, PLATFORM_ORDER, slugify } from "@/lib/blog";
import { savePostAction, type BlogActionState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";
const hintClass = "mt-1 text-xs text-muted";
const buttonClass =
  "rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60";

function Message({ state }: { state: BlogActionState }) {
  if (!state) {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success"
          : "rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
      }
    >
      {state.message}
    </p>
  );
}

export function PostForm({ post }: { post?: BlogPostRecord }) {
  const [state, action, pending] = useActionState(savePostAction, undefined);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  return (
    <form action={action} className="space-y-8">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            className={`${inputClass} font-mono`}
          />
          <p className={hintClass}>
            Generated from the title when left blank.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={post?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={post?.tags.join(", ") ?? ""}
          className={inputClass}
        />
        <p className={hintClass}>Comma separated.</p>
      </div>

      <div>
        <label htmlFor="body" className={labelClass}>
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          defaultValue={post?.body.join("\n\n") ?? ""}
          className={inputClass}
        />
        <p className={hintClass}>Blank lines separate paragraphs.</p>
      </div>

      <div>
        <label htmlFor="youtubeUrl" className={labelClass}>
          YouTube URL
        </label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          defaultValue={post?.youtubeUrl ?? ""}
          className={inputClass}
        />
      </div>

      <fieldset className="rounded-xl border border-hairline bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-widest text-muted">
          Cover image
        </legend>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="cover" className={labelClass}>
              Upload image
            </label>
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-cloud file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:border-signal-teal"
            />
            <p className={hintClass}>PNG, JPEG or WebP, up to 3MB.</p>
          </div>

          <div>
            <label htmlFor="coverUrl" className={labelClass}>
              Or image URL
            </label>
            <input
              id="coverUrl"
              name="coverUrl"
              type="url"
              defaultValue={post?.coverUrl ?? ""}
              className={inputClass}
            />
            <p className={hintClass}>An uploaded file takes precedence.</p>
          </div>
        </div>

        {post?.coverUrl ? (
          <div className="mt-5">
            <p className="text-xs text-muted">Current cover</p>
            <img
              src={post.coverUrl}
              alt={`Current cover for ${post.title}`}
              loading="lazy"
              className="mt-2 aspect-video w-full max-w-sm rounded-md border border-hairline bg-white object-cover"
            />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="rounded-xl border border-hairline bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-widest text-muted">
          Videos
        </legend>
        <div className="grid gap-5 lg:grid-cols-2">
          {PLATFORM_ORDER.map((platform) => {
            const video = post?.videos.find(
              (entry) => entry.platform === platform,
            );
            return (
              <div key={platform}>
                <label htmlFor={`video-${platform}`} className={labelClass}>
                  {PLATFORM_LABELS[platform]}
                </label>
                <input
                  id={`video-${platform}`}
                  name={`video-${platform}`}
                  type="url"
                  defaultValue={video?.url ?? ""}
                  className={inputClass}
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={post?.published ?? false}
          className="h-4 w-4 rounded border-hairline text-signal-teal focus:ring-signal-teal"
        />
        <label htmlFor="published" className="text-sm font-medium text-ink">
          Published
        </label>
      </div>

      <Message state={state} />

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving..." : post ? "Save post" : "Create post"}
        </button>
      </div>
    </form>
  );
}
