import { redirect } from "next/navigation";
import { Disclaimer } from "@/components/disclaimer";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (organization) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set up your workspace
          </h1>
          <p className="mt-2 text-sm text-muted">
            Tell us about your organization to get started.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-white p-6">
          <OnboardingForm />
        </div>

        <div className="mt-8">
          <Disclaimer variant="compact" />
        </div>
      </div>
    </div>
  );
}
