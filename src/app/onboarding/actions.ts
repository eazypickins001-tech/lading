"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error?: string } | undefined;

export async function createOrganization(
  state: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "trader");
  const country = String(formData.get("country") ?? "NG").trim() || "NG";

  if (!name) {
    return { error: "Organization name is required." };
  }

  const supabase = await createClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .insert({ name, type, country, created_by: user.id })
    .select("id")
    .single();

  if (error || !organization) {
    return { error: "We could not create your organization. Please try again." };
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({ org_id: organization.id, user_id: user.id, role: "owner" });

  if (membershipError) {
    return {
      error: "Organization created, but we could not finish setting up access.",
    };
  }

  redirect("/dashboard");
}
