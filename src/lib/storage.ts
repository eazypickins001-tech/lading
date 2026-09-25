import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentBranding } from "@/lib/documents/types";
import { createClient } from "@/lib/supabase/server";

export const DOCUMENT_BUCKET = "documents";
export const BRANDING_BUCKET = "branding";
export const BLOG_BUCKET = "blog";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_BRANDING_BYTES = 2 * 1024 * 1024;
const MAX_COVER_BYTES = 3 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 3600;

const COVER_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const DOCUMENT_MIME_ALLOWLIST = new Set<string>([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "application/msword",
]);

const BRANDING_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
};

export type BrandingKind = "logo" | "signature" | "seal";

const BRANDING_COLUMNS: Record<BrandingKind, string> = {
  logo: "logo_url",
  signature: "signature_url",
  seal: "seal_url",
};

export type ShipmentFile = {
  id: string;
  docType: string;
  fileUrl: string;
  status: string;
  generatedAt: string | null;
  createdAt: string;
  signedUrl: string | null;
};

type ShipmentDocumentRow = {
  id: string;
  doc_type: string;
  file_url: string | null;
  status: string;
  generated_at: string | null;
  created_at: string;
};

type BrandingRow = {
  logo_url: string | null;
  signature_url: string | null;
  seal_url: string | null;
};

export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_{2,}/g, "_");
  const trimmed = cleaned.replace(/^[._]+/, "").slice(0, 120);
  return trimmed || "file";
}

export async function uploadShipmentFile(
  orgId: string,
  shipmentId: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("File exceeds the 10MB limit.");
  }
  if (!DOCUMENT_MIME_ALLOWLIST.has(file.type)) {
    throw new Error("Unsupported file type.");
  }

  const supabase = await createClient();
  const path = `${orgId}/${shipmentId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error("Could not upload the file.");
  }

  const { error: insertError } = await supabase
    .from("shipment_documents")
    .insert({
      shipment_id: shipmentId,
      doc_type: "other",
      file_url: path,
      status: "uploaded",
      data: { fileName: file.name, mimeType: file.type, size: file.size },
    });

  if (insertError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
    throw new Error("Could not save the file record.");
  }

  return path;
}

export async function listShipmentFiles(
  shipmentId: string,
): Promise<ShipmentFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipment_documents")
    .select("id, doc_type, file_url, status, generated_at, created_at")
    .eq("shipment_id", shipmentId)
    .not("file_url", "is", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as ShipmentDocumentRow[];

  return Promise.all(
    rows.map(async (row) => {
      const fileUrl = row.file_url ?? "";
      const { data: signed } = await supabase.storage
        .from(DOCUMENT_BUCKET)
        .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECONDS);

      return {
        id: row.id,
        docType: row.doc_type,
        fileUrl,
        status: row.status,
        generatedAt: row.generated_at,
        createdAt: row.created_at,
        signedUrl: signed?.signedUrl ?? null,
      };
    }),
  );
}

export async function deleteShipmentFile(id: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipment_documents")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();

  const path = (data as { file_url: string | null } | null)?.file_url ?? null;
  if (path) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
  }

  await supabase.from("shipment_documents").delete().eq("id", id);
}

export async function uploadBranding(
  orgId: string,
  kind: BrandingKind,
  file: File,
): Promise<string> {
  if (file.size > MAX_BRANDING_BYTES) {
    throw new Error("Image exceeds the 2MB limit.");
  }
  const extension = BRANDING_MIME_EXTENSIONS[file.type];
  if (!extension) {
    throw new Error("Only PNG, JPEG or SVG images are allowed.");
  }

  const supabase = await createClient();
  const path = `${orgId}/${kind}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BRANDING_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error("Could not upload the image.");
  }

  const { data: publicUrl } = supabase.storage
    .from(BRANDING_BUCKET)
    .getPublicUrl(path);
  const url = publicUrl.publicUrl;

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ [BRANDING_COLUMNS[kind]]: url })
    .eq("id", orgId);

  if (updateError) {
    await supabase.storage.from(BRANDING_BUCKET).remove([path]);
    throw new Error("Could not save the branding image.");
  }

  return url;
}

export async function uploadBlogCover(file: File): Promise<string> {
  if (file.size > MAX_COVER_BYTES) {
    throw new Error("Image exceeds the 3MB limit.");
  }
  const extension = COVER_MIME_EXTENSIONS[file.type];
  if (!extension) {
    throw new Error("Only PNG, JPEG or WebP images are allowed.");
  }

  const supabase = await createClient();
  const path = `cover-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BLOG_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error("Could not upload the cover image.");
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${path}`;
}

export async function getOrgBranding(
  orgId: string,
  client?: SupabaseClient,
): Promise<DocumentBranding> {
  const supabase = client ?? (await createClient());
  const { data } = await supabase
    .from("organizations")
    .select("logo_url, signature_url, seal_url")
    .eq("id", orgId)
    .maybeSingle();

  const row = data as BrandingRow | null;

  return {
    logoUrl: row?.logo_url ?? null,
    signatureUrl: row?.signature_url ?? null,
    sealUrl: row?.seal_url ?? null,
  };
}
