import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";

const stats = [
  { label: "Shipments", value: "0" },
  { label: "Documents", value: "0" },
  { label: "Consistency checks", value: "0" },
  { label: "Data sources", value: "8" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-deep-harbor text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-[0.2em]">LADING</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.type}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {organization.name}
        </h1>
        <p className="mt-2 text-muted">
          Signed in as {user.email} · {organization.plan} plan
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-hairline bg-white p-6"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-deep-harbor">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
