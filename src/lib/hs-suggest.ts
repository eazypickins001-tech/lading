import { chatComplete } from "@/lib/ai";

export type HsSuggestion = {
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
  reason: string;
};

const SYSTEM_PROMPT =
  "You are a customs classification assistant for international trade. Suggest up to 5 candidate 6-digit Harmonized System (HS) codes for the product. Respond with a JSON array only, no prose. Each item must be {\"code\":\"6 digits\",\"description\":\"short heading description\",\"confidence\":\"high|medium|low\",\"reason\":\"one short sentence\"}. Never invent codes that do not exist. Use low confidence when unsure.";

function extractJsonArray(raw: string): unknown[] | null {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function toConfidence(value: unknown): HsSuggestion["confidence"] {
  const text = String(value ?? "").toLowerCase();
  if (text === "high" || text === "medium" || text === "low") {
    return text;
  }
  return "low";
}

export async function suggestHsCodes(
  productDescription: string,
  destinationCountry: string,
): Promise<HsSuggestion[]> {
  const raw = await chatComplete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Product description: ${productDescription}\nDestination country: ${destinationCountry}\nReturn the JSON array now.`,
      },
    ],
    { maxTokens: 2048, temperature: 0.1 },
  );

  const parsed = extractJsonArray(raw);
  if (!parsed) {
    return [];
  }

  return parsed
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const digits = String(record.code ?? "").replace(/[^0-9]/g, "");
      return {
        code: digits,
        description: String(record.description ?? "").trim(),
        confidence: toConfidence(record.confidence),
        reason: String(record.reason ?? "").trim(),
      };
    })
    .filter((item) => item.code.length >= 4 && item.description.length > 0)
    .slice(0, 5);
}
