import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, country")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileRow | null;

  const orgFacts = [
    { label: "Organization", value: organization.name },
    { label: "Type", value: organization.type },
    { label: "Plan", value: organization.plan },
    { label: "Your role", value: organization.role },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="profile" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Keep your details up to date so documents carry the right party.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Your details
            </h2>
            <div className="mt-5">
              <ProfileForm
                profile={{
                  fullName: profile?.full_name ?? "",
                  email: profile?.email ?? user.email ?? "",
                  phone: profile?.phone ?? "",
                  country: profile?.country ?? "NG",
                }}
              />
            </div>
          </section>

          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Organization
            </h2>
            <dl className="mt-5 space-y-4">
              {orgFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-medium uppercase tracking-widest text-muted">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm capitalize text-ink">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-xs text-muted">
              Organization details are managed by your workspace owner.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
