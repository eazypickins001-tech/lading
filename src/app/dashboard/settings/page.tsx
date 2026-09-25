import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { getOrgBranding } from "@/lib/storage";
import { BrandingForm } from "./branding-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const branding = await getOrgBranding(organization.id);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="settings" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Add your branding so generated documents carry your logo, signature
          and seal.
        </p>

        <section className="mt-10 max-w-2xl rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Document branding
          </h2>
          <div className="mt-5">
            <BrandingForm
              branding={{
                logoUrl: branding.logoUrl,
                signatureUrl: branding.signatureUrl,
                sealUrl: branding.sealUrl,
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
