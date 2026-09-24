import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { getDashboardCounts } from "@/lib/shipments";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const counts = await getDashboardCounts(organization.id);

  const stats = [
    {
      label: "Shipments",
      value: counts.shipments,
      href: "/dashboard/shipments" as const,
    },
    { label: "Documents", value: counts.documents },
    { label: "Consistency checks", value: counts.findings },
    { label: "Data sources", value: counts.dataSources },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="dashboard" />

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
          {stats.map((stat) => {
            const card = (
              <div className="rounded-xl border border-hairline bg-white p-6 transition-colors hover:border-signal-teal">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-deep-harbor">
                  {stat.value}
                </p>
              </div>
            );
            return stat.href ? (
              <Link key={stat.label} href={stat.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={stat.label}>{card}</div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/dashboard/shipments"
            className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            View shipments
          </Link>
          <Link
            href="/dashboard/shipments/new"
            className="rounded-md border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:bg-white"
          >
            New shipment
          </Link>
        </div>
      </main>
    </div>
  );
}
