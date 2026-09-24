import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.2em] text-deep-harbor"
          >
            LADING
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to your trade workspace.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-white p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New to Lading?{" "}
          <Link
            href="/signup"
            className="font-medium text-signal-teal hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
