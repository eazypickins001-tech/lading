import type {
  BlogPostRecord,
  BlogVideo,
  SocialPlatform,
} from "@/lib/blog";
import { PLATFORM_ORDER } from "@/lib/blog";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type BlogPostInput = {
  slug: string;
  title: string;
  description: string;
  body: string[];
  tags: string[];
  youtubeUrl: string | null;
  videos: BlogVideo[];
  published: boolean;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: unknown;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  youtube_url: string | null;
  videos: unknown;
  created_at: string;
};

const SELECT_COLUMNS =
  "id, slug, title, description, body, tags, published, published_at, youtube_url, videos, created_at";

function isPlatform(value: string): value is SocialPlatform {
  return (PLATFORM_ORDER as string[]).includes(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function toVideos(value: unknown): BlogVideo[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const videos: BlogVideo[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const platform = record.platform;
    const url = record.url;
    if (typeof platform === "string" && isPlatform(platform) && typeof url === "string") {
      videos.push({ platform, url });
    }
  }
  return videos;
}

function toRecord(row: BlogPostRow): BlogPostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    publishedAt: row.published_at ?? "",
    tags: toStringArray(row.tags),
    youtubeUrl: row.youtube_url ?? undefined,
    videos: toVideos(row.videos),
    body: toStringArray(row.body),
    published: row.published,
    createdAt: row.created_at,
  };
}

export async function listPublishedPosts(): Promise<BlogPostRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as BlogPostRow[]).map(toRecord);
}

export async function getPublishedPost(
  slug: string,
): Promise<BlogPostRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toRecord(data as BlogPostRow);
}

export async function listAllPosts(): Promise<BlogPostRecord[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as BlogPostRow[]).map(toRecord);
}

export async function getPostById(id: string): Promise<BlogPostRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toRecord(data as BlogPostRow);
}

export async function createPost(input: BlogPostInput): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description || null,
      body: input.body,
      tags: input.tags,
      published: input.published,
      published_at: input.published ? new Date().toISOString() : null,
      youtube_url: input.youtubeUrl,
      videos: input.videos,
    })
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }

  return (data as { id: string }).id;
}

export async function updatePost(
  id: string,
  input: BlogPostInput,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const existing = data as { published_at: string | null } | null;
  const publishedAt = existing?.published_at
    ? existing.published_at
    : input.published
      ? new Date().toISOString()
      : null;

  const { error } = await admin
    .from("blog_posts")
    .update({
      slug: input.slug,
      title: input.title,
      description: input.description || null,
      body: input.body,
      tags: input.tags,
      published: input.published,
      published_at: publishedAt,
      youtube_url: input.youtubeUrl,
      videos: input.videos,
    })
    .eq("id", id);

  return !error;
}

export async function deletePost(id: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  return !error;
}

export async function setPublished(
  id: string,
  published: boolean,
): Promise<boolean> {
  const admin = createAdminClient();
  const update: { published: boolean; published_at?: string } = { published };

  if (published) {
    const { data } = await admin
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    const existing = data as { published_at: string | null } | null;
    if (!existing?.published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { error } = await admin
    .from("blog_posts")
    .update(update)
    .eq("id", id);

  return !error;
}
