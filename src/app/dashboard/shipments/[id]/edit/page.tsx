import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrentUser } from "@/lib/auth";
import { listParties } from "@/lib/parties";
import { getShipmentWithItems, listIncoterms } from "@/lib/shipments";
import { EditShipmentForm } from "./edit-form";

export const metadata: Metadata = {
  title: "Edit shipment",
};

export default async function EditShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const shipment = await getShipmentWithItems(id);
  if (!shipment) {
    notFound();
  }

  const [incoterms, parties] = await Promise.all([
    listIncoterms(),
    listParties(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="shipments" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {shipment.organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Edit shipment
        </h1>
        <p className="mt-2 text-muted">
          Update the shipment details and goods. Changes apply to every
          document generated from this record.
        </p>

        <div className="mt-8">
          <EditShipmentForm
            shipment={shipment}
            incoterms={incoterms}
            parties={parties}
          />
        </div>
      </main>
    </div>
  );
}
