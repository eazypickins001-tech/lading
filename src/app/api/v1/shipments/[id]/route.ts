import { withApiKey } from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShipmentWithItems } from "@/lib/shipments";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiKey(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { id } = await params;
  const admin = createAdminClient();
  const shipment = await getShipmentWithItems(id, admin);

  if (!shipment || shipment.org_id !== auth.orgId) {
    return Response.json({ error: "Shipment not found." }, { status: 404 });
  }

  return Response.json({ shipment });
}
