"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileState =
  | {
      status: "success" | "error";
      message: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

export async function updateProfileAction(
  state: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!fullName) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: { full_name: "Full name is required." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      phone: phone || null,
      country: country || "NG",
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      status: "error",
      message: "We could not save your profile. Please try again.",
    };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { status: "success", message: "Profile saved." };
}
