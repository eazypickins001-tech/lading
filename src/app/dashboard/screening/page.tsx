import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrentUser } from "@/lib/auth";
import { ScreeningForm } from "./screening-form";

export default async function ScreeningPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="screening" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Compliance
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Restricted party screening
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Screen a person or company name against the US Consolidated Screening
          List before you trade.
        </p>

        <ScreeningForm />
      </main>
    </div>
  );
}
