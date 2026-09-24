import type { Metadata } from "next";
import Link from "next/link";
import { LadingLogo } from "@/components/lading-logo";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Lading home" className="inline-flex">
            <LadingLogo variant="onLight" />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {error === "link" ? (
          <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            That reset link is invalid or has expired. Request a new one below.
          </p>
        ) : null}

        <div className="rounded-xl border border-hairline bg-white p-6">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-signal-teal hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
