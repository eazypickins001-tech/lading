import { chatComplete } from "@/lib/ai";

export type HsSuggestion = {
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
  reason: string;
};

const SYSTEM_PROMPT =
  "You are a customs classification assistant for international trade. Suggest up to 5 candidate 6-digit Harmonized System (HS) codes for the product. Respond with a JSON array only, no prose, no code fences. Each item must be {\"code\":\"6 digits\",\"description\":\"short heading description\",\"confidence\":\"high|medium|low\",\"reason\":\"one short sentence\"}. Never invent codes that do not exist. Use low confidence when unsure.";

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractItems(raw: string): unknown[] {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (cleaned.length === 0) {
    return [];
  }

  let parsed = tryParse(cleaned);

  if (parsed === undefined) {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start !== -1 && end > start) {
      parsed = tryParse(cleaned.slice(start, end + 1));
    }
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const nested = record.suggestions ?? record.results ?? record.data;
    if (Array.isArray(nested)) {
      parsed = nested;
    }
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  const salvaged: unknown[] = [];
  const objectPattern = /\{[^{}]*\}/g;
  let match = objectPattern.exec(cleaned);
  while (match !== null) {
    const candidate = tryParse(match[0]);
    if (candidate !== undefined) {
      salvaged.push(candidate);
    }
    match = objectPattern.exec(cleaned);
  }

  return salvaged;
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
    {
      maxTokens: 4096,
      temperature: 0.1,
      validate: (content) => extractItems(content).length > 0,
    },
  );

  const items = extractItems(raw);

  return items
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
