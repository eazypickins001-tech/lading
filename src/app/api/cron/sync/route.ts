import { timingSafeEqual } from "node:crypto";
import { runDueSources } from "@/lib/sync/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");

  if (!secret || !header) {
    return new Response("Unauthorized", { status: 401 });
  }

  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const provided = Buffer.from(header, "utf8");

  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results = await runDueSources();

  return Response.json({ ran: results.length, results });
}
