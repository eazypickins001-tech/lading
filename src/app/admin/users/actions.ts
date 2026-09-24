"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, planFor, type PlanId } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUserActionState =
  | {
      status: "success" | "error";
      message: string;
      link?: string;
    }
  | undefined;

async function callerIsAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return isAdminEmail(user?.email);
}

export async function updateUserProfileAction(
  state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await callerIsAdmin())) {
    return { status: "error", message: "You are not authorized to do that." };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!userId) {
    return { status: "error", message: "A user is required." };
  }

  if (!fullName) {
    return { status: "error", message: "Full name is required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      phone: phone || null,
      country: country || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    return { status: "error", message: "Could not save the profile." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/users/[id]", "page");

  return { status: "success", message: "Profile saved." };
}

export async function setUserPasswordAction(
  state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await callerIsAdmin())) {
    return { status: "error", message: "You are not authorized to do that." };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!userId) {
    return { status: "error", message: "A user is required." };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
    };
  }

  if (password !== confirm) {
    return { status: "error", message: "Passwords do not match." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    return { status: "error", message: "Could not update the password." };
  }

  return { status: "success", message: "Password updated." };
}

export async function generateResetLinkAction(
  state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await callerIsAdmin())) {
    return { status: "error", message: "You are not authorized to do that." };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!userId || !email) {
    return { status: "error", message: "A user and email are required." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    },
  });

  if (error || !data) {
    return { status: "error", message: "Could not generate a reset link." };
  }

  return {
    status: "success",
    message: "Reset link generated.",
    link: data.properties.action_link,
  };
}

export async function changeOrgPlanAction(
  state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  if (!(await callerIsAdmin())) {
    return { status: "error", message: "You are not authorized to do that." };
  }

  const orgId = String(formData.get("orgId") ?? "").trim();
  const planId = String(formData.get("plan") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!orgId) {
    return { status: "error", message: "An organization is required." };
  }

  if (!(planId in PLANS)) {
    return { status: "error", message: "Choose a valid plan." };
  }

  const plan = planId as PlanId;
  const admin = createAdminClient();

  const { error: orgError } = await admin
    .from("organizations")
    .update({ plan })
    .eq("id", orgId);

  if (orgError) {
    return { status: "error", message: "Could not update the plan." };
  }

  if (plan === "free") {
    const { error: cancelError } = await admin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("org_id", orgId)
      .eq("status", "active");

    if (cancelError) {
      return {
        status: "error",
        message: "Plan updated but the subscription could not be cancelled.",
      };
    }
  } else {
    const periodStart = new Date();
    const periodEnd = new Date(
      periodStart.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const values = {
      plan,
      status: "active",
      provider: "manual",
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    };

    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("org_id", orgId)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("subscriptions")
        .update(values)
        .eq("id", (existing as { id: string }).id);

      if (error) {
        return { status: "error", message: "Could not save the plan." };
      }
    } else {
      const { error } = await admin
        .from("subscriptions")
        .insert({ org_id: orgId, ...values });

      if (error) {
        return { status: "error", message: "Could not save the plan." };
      }
    }
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/users/[id]", "page");
  revalidatePath("/admin/organizations");
  revalidatePath("/dashboard/billing");

  if (userId) {
    revalidatePath(`/admin/users/${userId}`);
  }

  return {
    status: "success",
    message:
      plan === "free"
        ? "Organization moved to the Free plan."
        : `Organization moved to the ${planFor(plan).name} plan.`,
  };
}
