import type { Metadata } from "next";
import Link from "next/link";
import { LadingLogo } from "@/components/lading-logo";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Lading home" className="inline-flex">
            <LadingLogo variant="onLight" />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose a new password for your account.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-white p-6">
          {user ? (
            <ResetPasswordForm />
          ) : (
            <div className="space-y-4 text-sm text-ink">
              <p>
                This reset link is invalid or has expired. Request a new link to
                continue.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block font-medium text-signal-teal hover:underline"
              >
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
