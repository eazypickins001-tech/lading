import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { listParties } from "@/lib/parties";
import { PartiesClient } from "./parties-client";

export const metadata: Metadata = {
  title: "Contacts",
};

export default async function PartiesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const parties = await listParties();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="parties" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Keep the exporters, consignees, and other parties you trade with in one
          place, then reuse them on any shipment.
        </p>

        <PartiesClient parties={parties} />
      </main>
    </div>
  );
}
