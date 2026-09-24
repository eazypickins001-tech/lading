"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

export async function signUp(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !organizationName || !email || !password) {
    return { error: "Please complete every field." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session || !data.user) {
    return {
      success:
        "Check your email to confirm your account, then sign in to finish setting up your organization.",
    };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({ name: organizationName, created_by: data.user.id })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return { error: "We could not create your organization. Please try again." };
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      org_id: organization.id,
      user_id: data.user.id,
      role: "owner",
    });

  if (membershipError) {
    return {
      error:
        "Your account is ready, but we could not finish setting up your organization.",
    };
  }

  redirect("/dashboard");
}

export async function signIn(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter the email address for your account." };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`;

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  } catch {
    return {
      success:
        "If an account exists for that email, a reset link is on its way.",
    };
  }

  return {
    success: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function updatePassword(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
