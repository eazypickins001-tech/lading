import Link from "next/link";
import { LadingLogo } from "@/components/lading-logo";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Lading home" className="inline-flex">
            <LadingLogo variant="onLight" />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Start free. No card required.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-white p-6">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-signal-teal hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
