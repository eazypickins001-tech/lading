export type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "threads"
  | "bluesky";

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  bluesky: "Bluesky",
};

export const PLATFORM_ORDER: SocialPlatform[] = [
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "threads",
  "bluesky",
];

export type BlogVideo = {
  platform: SocialPlatform;
  url: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  youtubeUrl?: string;
  videos: BlogVideo[];
  body: string[];
  coverUrl: string | null;
};

export type BlogPostRecord = BlogPost & {
  id: string;
  published: boolean;
  createdAt: string;
};

export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (!match) {
    return null;
  }
  const id = match[1];
  return id.startsWith("REPLACE") ? null : id;
}

export function coverImageUrl(
  post: Pick<BlogPost, "coverUrl" | "youtubeUrl">,
): string | null {
  if (post.coverUrl) {
    return post.coverUrl;
  }
  if (post.youtubeUrl) {
    const id = youtubeId(post.youtubeUrl);
    if (id) {
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }
  return null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
