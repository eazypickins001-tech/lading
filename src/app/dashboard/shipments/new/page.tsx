import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { listIncoterms } from "@/lib/shipments";
import { ShipmentForm } from "./shipment-form";

export default async function NewShipmentPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const incoterms = await listIncoterms();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="shipments" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          New shipment
        </h1>
        <p className="mt-2 text-muted">
          Capture the shipment and its goods once. Lading reuses this data
          across every document.
        </p>

        <div className="mt-8">
          <ShipmentForm incoterms={incoterms} />
        </div>
      </main>
    </div>
  );
}
