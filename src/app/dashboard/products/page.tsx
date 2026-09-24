import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getActiveOrg, getCurrentUser } from "@/lib/auth";
import { listProducts } from "@/lib/products";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getActiveOrg();
  if (!organization) {
    redirect("/onboarding");
  }

  const products = await listProducts();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="products" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Build a catalog of the goods you trade so line items and HS codes stay
          consistent across shipments.
        </p>

        <ProductsClient products={products} />
      </main>
    </div>
  );
}
