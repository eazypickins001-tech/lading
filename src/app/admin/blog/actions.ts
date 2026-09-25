"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import type { BlogVideo } from "@/lib/blog";
import { PLATFORM_ORDER, slugify } from "@/lib/blog";
import {
  createPost,
  deletePost,
  setPublished,
  updatePost,
  type BlogPostInput,
} from "@/lib/blog-store";
import { uploadBlogCover } from "@/lib/storage";

export type BlogActionState =
  | {
      status: "success" | "error";
      message: string;
    }
  | undefined;

function parseBody(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function parseVideos(formData: FormData): BlogVideo[] {
  const videos: BlogVideo[] = [];
  for (const platform of PLATFORM_ORDER) {
    const url = String(formData.get(`video-${platform}`) ?? "").trim();
    if (url) {
      videos.push({ platform, url });
    }
  }
  return videos;
}

function revalidatePost(slug: string): void {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function savePostAction(
  state: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return { status: "error", message: "You are not authorized to do that." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);
  const description = String(formData.get("description") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const body = parseBody(String(formData.get("body") ?? ""));
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim() || null;
  const videos = parseVideos(formData);
  const published = formData.get("published") === "on";
  const coverFile = formData.get("cover");
  let coverUrl = String(formData.get("coverUrl") ?? "").trim() || null;

  if (!title) {
    return { status: "error", message: "A title is required." };
  }

  if (!slug) {
    return { status: "error", message: "A slug is required." };
  }

  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      coverUrl = await uploadBlogCover(coverFile);
    } catch {
      return { status: "error", message: "Could not upload the cover image." };
    }
  }

  const input: BlogPostInput = {
    slug,
    title,
    description,
    body,
    tags,
    youtubeUrl,
    videos,
    published,
    coverUrl,
  };

  const saved = id
    ? await updatePost(id, input)
    : (await createPost(input)) !== null;

  if (!saved) {
    return {
      status: "error",
      message: "Could not save the post. The slug may already be in use.",
    };
  }

  revalidatePost(slug);
  redirect("/admin/blog");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!id) {
    return;
  }

  await deletePost(id);
  revalidatePost(slug);
}

export async function togglePublishAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const published = String(formData.get("published") ?? "") === "true";

  if (!id) {
    return;
  }

  await setPublished(id, published);
  revalidatePost(slug);
}
