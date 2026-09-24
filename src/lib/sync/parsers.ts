export type ParsedItem = {
  currency: string;
  rateNgn: number;
};

export type ParsedResult = {
  kind: "fx";
  items: ParsedItem[];
};

const FX_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "CNY",
  "JPY",
  "CHF",
  "ZAR",
  "SAR",
  "DKK",
  "CFA",
  "WAU",
  "SDR",
] as const;

const NCS_FX_PATTERN = new RegExp(
  `\\b(${FX_CURRENCY_CODES.join("|")})\\b[^0-9]{0,80}?(\\d{1,3}(?:,\\d{3})*\\.\\d{2})`,
  "g",
);

export function parseNcsFx(text: string): ParsedItem[] {
  if (!text) {
    return [];
  }

  const items: ParsedItem[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(NCS_FX_PATTERN)) {
    const currency = match[1];
    const rawRate = match[2];

    if (!currency || !rawRate || seen.has(currency)) {
      continue;
    }

    const rateNgn = Number(rawRate.replace(/,/g, ""));

    if (!Number.isFinite(rateNgn)) {
      continue;
    }

    seen.add(currency);
    items.push({ currency, rateNgn });
  }

  return items;
}

export function parseErApiFx(text: string): ParsedItem[] {
  if (!text) {
    return [];
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return [];
  }

  const record = (payload ?? {}) as Record<string, unknown>;
  const rates = record.rates;

  if (!rates || typeof rates !== "object") {
    return [];
  }

  const table = rates as Record<string, unknown>;
  const items: ParsedItem[] = [];

  for (const code of FX_CURRENCY_CODES) {
    const value = table[code];
    const num = typeof value === "number" ? value : Number(value);

    if (Number.isFinite(num) && num > 0) {
      items.push({ currency: code, rateNgn: Math.round((1 / num) * 100) / 100 });
    }
  }

  return items;
}

export function parseSource(
  parserKey: string | null,
  text: string,
): ParsedResult | null {
  if (parserKey === "ncs_fx") {
    const items = parseNcsFx(text);
    return items.length > 0 ? { kind: "fx", items } : null;
  }

  if (parserKey === "erapi_fx") {
    const items = parseErApiFx(text);
    return items.length > 0 ? { kind: "fx", items } : null;
  }

  return null;
}
