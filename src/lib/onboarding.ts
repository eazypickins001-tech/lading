import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  profileComplete: boolean;
  hasShipment: boolean;
  hasDocuments: boolean;
  hasChecks: boolean;
  hasRequirements: boolean;
};

export async function getOnboardingState(
  orgId: string,
): Promise<OnboardingState> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  let profileComplete = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    profileComplete = Boolean(data?.full_name?.trim());
  }

  const [shipments, documents, findings] = await Promise.all([
    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
    supabase
      .from("shipment_documents")
      .select("id, shipments!inner(org_id)", { count: "exact", head: true })
      .eq("shipments.org_id", orgId),
    supabase
      .from("consistency_findings")
      .select("id, shipments!inner(org_id)", { count: "exact", head: true })
      .eq("shipments.org_id", orgId),
  ]);

  const hasShipment = (shipments.count ?? 0) > 0;

  return {
    profileComplete,
    hasShipment,
    hasDocuments: (documents.count ?? 0) > 0,
    hasChecks: (findings.count ?? 0) > 0,
    hasRequirements: hasShipment,
  };
}
