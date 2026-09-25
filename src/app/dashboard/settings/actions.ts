"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/audit";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { uploadBranding, type BrandingKind } from "@/lib/storage";

export type BrandingState =
  | {
      status: "success" | "error";
      message: string;
    }
  | undefined;

const KINDS: BrandingKind[] = ["logo", "signature", "seal"];
const BRANDING_ROLES = ["owner", "admin"];

export async function saveBrandingAction(
  state: BrandingState,
  formData: FormData,
): Promise<BrandingState> {
  void state;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!BRANDING_ROLES.includes(organization.role)) {
    return {
      status: "error",
      message: "Only owners and admins can update branding.",
    };
  }

  let uploaded = 0;

  for (const kind of KINDS) {
    const file = formData.get(kind);
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }
    try {
      await uploadBranding(organization.id, kind, file);
      uploaded += 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not upload the image.";
      return { status: "error", message };
    }
  }

  if (uploaded === 0) {
    return { status: "error", message: "Choose at least one image to upload." };
  }

  await recordAuditEvent({
    orgId: organization.id,
    userId: user.id,
    action: "branding.update",
    entityType: "organization",
    entityId: organization.id,
    metadata: { uploaded },
  });

  revalidatePath("/dashboard/settings");

  return { status: "success", message: "Branding saved." };
}
