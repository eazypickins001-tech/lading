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

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "documents-that-delay-nigerian-imports",
    title: "The 3 documents that delay most Nigerian imports",
    description:
      "Form M, PAAR and SONCAP cause most port delays. Here is what each one is and when you need it.",
    publishedAt: "2026-09-20",
    tags: ["Nigeria", "Import", "Compliance"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "Most Nigerian import delays are not caused by shipping. They are caused by three documents that are missing, wrong, or out of order: Form M, the Pre-Arrival Assessment Report (PAAR), and SONCAP.",
      "Form M is registered with your bank before shipment. PAAR is generated from the Form M and the shipping documents so customs can assess duty. SONCAP proves that regulated products meet Nigerian standards.",
      "In this video we walk through the order they must be obtained in, the mistakes that get each one rejected, and the simple check that catches them before your container reaches the port.",
    ],
  },
  {
    slug: "what-is-a-paar",
    title: "What is a PAAR and why does it cost you demurrage?",
    description:
      "A one-minute explanation of the Pre-Arrival Assessment Report and the errors that send it back.",
    publishedAt: "2026-09-18",
    tags: ["Nigeria", "Customs", "PAAR"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "PAAR stands for Pre-Arrival Assessment Report. It is the document customs uses to assess duty on your goods before they arrive.",
      "It is generated from your Form M and the shipping documents. When the details on those documents disagree, the PAAR is rejected and your cargo sits at the port, accruing demurrage every single day.",
      "The fix is boring but effective: check that the invoice, packing list, bill of lading and Form M all agree before you submit. That is exactly what Lading's consistency check does automatically.",
    ],
  },
  {
    slug: "fob-by-air-incoterm-mistake",
    title: "FOB by air: the Incoterm mistake that voids your insurance",
    description:
      "FOB and CIF are sea-only terms. Using them for air freight creates a risk gap you may not notice until a claim.",
    publishedAt: "2026-09-15",
    tags: ["Incoterms", "Risk", "Air freight"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "FOB, FAS, CFR and CIF are written for sea and inland waterway transport only. They assume the goods move on a vessel.",
      "When you use FOB on an air shipment, the point where risk transfers becomes ambiguous. If the goods are damaged in transit, your insurer and the carrier can both point at the other party.",
      "For air, courier, road and rail, use FCA, CPT, CIP, DAP or DDP. Lading's trade terms tool flags sea-only terms when you select a non-sea mode, before the contract is signed.",
    ],
  },
  {
    slug: "hs-code-wrong-digit-duty",
    title: "HS codes: how one wrong digit doubles your duty",
    description:
      "Classification drives duty, levies and permits. A single digit can change everything.",
    publishedAt: "2026-09-12",
    tags: ["HS codes", "Duty", "Classification"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "The Harmonized System code on your declaration decides the duty rate, the levies, and which permits apply.",
      "Two products that look similar can sit under different headings with very different rates. A monitor and a television are not the same thing to customs. Neither are fresh and dried fruit.",
      "Lading's AI assistant suggests candidate codes from a plain description, ranked by confidence, so you can check the likely options before you commit to a declaration.",
    ],
  },
  {
    slug: "five-minute-pre-shipment-check",
    title: "The 5-minute pre-shipment check that prevents demurrage",
    description:
      "Five checks across your document set that catch the errors that cost the most.",
    publishedAt: "2026-09-10",
    tags: ["Consistency", "Demurrage", "Workflow"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "Demurrage is what you pay for someone else's paperwork error. The good news is that most of those errors are findable in five minutes.",
      "Check five things: the consignee name and address match across every document, the quantities and weights reconcile between the invoice and the packing list, the HS code is present and consistent, the Incoterm matches the mode, and the parties are screened.",
      "Lading runs these checks automatically and shows you exactly what to fix before anything reaches a customs desk.",
    ],
  },
  {
    slug: "importing-into-nigeria-checklist",
    title: "Importing into Nigeria: the full document checklist",
    description:
      "Every document a Nigerian import needs, from Form M to the final clearance, in order.",
    publishedAt: "2026-09-08",
    tags: ["Nigeria", "Import", "Checklist"],
    youtubeUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
    videos: [
      { platform: "youtube", url: "https://www.youtube.com/@lading" },
      { platform: "tiktok", url: "https://www.tiktok.com/@lading" },
      { platform: "instagram", url: "https://www.instagram.com/lading" },
      { platform: "facebook", url: "https://www.facebook.com/lading" },
      { platform: "threads", url: "https://www.threads.net/@lading" },
      { platform: "bluesky", url: "https://bsky.app/profile/lading" },
    ],
    body: [
      "A Nigerian import typically needs a commercial invoice, a packing list, a bill of lading or air waybill, Form M, a PAAR, and a SONCAP certificate for regulated products.",
      "Food, drugs and cosmetics also need NAFDAC registration. Some goods need an import licence or a permit from another agency.",
      "Lading's requirement checker takes the HS code, origin, destination and direction, and returns the documents and permits that apply, with the issuing authority and a source link.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
