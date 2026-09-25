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
};

export type BlogPostRecord = BlogPost & {
  id: string;
  published: boolean;
  createdAt: string;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
