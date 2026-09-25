import { authenticateApiKey } from "@/lib/api-keys";
import { allowRequest } from "@/lib/rate-limit";

export type ApiKeyContext = {
  orgId: string;
  keyId: string;
};

export async function withApiKey(
  request: Request,
): Promise<ApiKeyContext | Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const allowed = await allowRequest(`api:${auth.keyId}`, 120, 60);
  if (!allowed) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  return auth;
}
