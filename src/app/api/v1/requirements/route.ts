import { withApiKey } from "@/lib/api/guard";
import type { TradeChannel } from "@/lib/documents/types";
import { getRequiredDocuments } from "@/lib/requirements";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CHANNELS: TradeChannel[] = ["import", "export"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function booleanAttributes(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }
  const attributes: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "boolean") {
      attributes[key] = entry;
    }
  }
  return attributes;
}

export async function POST(request: Request) {
  const auth = await withApiKey(request);
  if (auth instanceof Response) {
    return auth;
  }

  const raw: unknown = await request.json().catch(() => null);
  if (!isRecord(raw)) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const channel = stringValue(raw.channel);
  const originCountry = stringValue(raw.originCountry)?.trim();
  const destinationCountry = stringValue(raw.destinationCountry)?.trim();

  if (!channel || !CHANNELS.includes(channel as TradeChannel)) {
    return Response.json(
      { error: "channel must be import or export." },
      { status: 400 },
    );
  }
  if (!originCountry || !destinationCountry) {
    return Response.json(
      { error: "originCountry and destinationCountry are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const documents = await getRequiredDocuments(
    {
      hsCode: stringValue(raw.hsCode)?.trim() || null,
      originCountry,
      destinationCountry,
      channel: channel as TradeChannel,
      attributes: booleanAttributes(raw.attributes),
    },
    admin,
  );

  return Response.json({ documents });
}
