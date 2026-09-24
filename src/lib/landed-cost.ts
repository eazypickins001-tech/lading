import type { SupabaseClient } from "@supabase/supabase-js";

export type LandedCostInput = {
  fob: number;
  freight: number;
  insurance: number;
  dutyRate: number;
  extraLevyRate?: number;
  vatRate?: number;
  exchangeRate?: number;
};

export type LandedCostLine = {
  label: string;
  rate?: number;
  amount: number;
  amountNgn?: number;
};

export type LandedCostBreakdown = {
  cif: number;
  customsDuty: number;
  ciss: number;
  etls: number;
  surcharge: number;
  extraLevy: number;
  vat: number;
  total: number;
  totalNgn: number;
  lines: LandedCostLine[];
};

export type TariffInfo = {
  dutyRate: number;
  vatRate: number;
  levies: Record<string, number>;
  sourceUrl: string | null;
};

export function calculateLandedCost(
  input: LandedCostInput,
): LandedCostBreakdown {
  const vatRate = input.vatRate ?? 7.5;
  const extraLevyRate = input.extraLevyRate ?? 0;
  const exchangeRate = input.exchangeRate;
  const toNgn = (amount: number): number | undefined =>
    exchangeRate === undefined ? undefined : amount * exchangeRate;

  const cif = input.fob + input.freight + input.insurance;
  const customsDuty = (input.dutyRate / 100) * cif;
  const ciss = 0.04 * input.fob;
  const etls = 0.005 * cif;
  const surcharge = 0.07 * customsDuty;
  const extraLevy = (extraLevyRate / 100) * cif;
  const vatBase = cif + customsDuty + ciss + etls + surcharge + extraLevy;
  const vat = (vatRate / 100) * vatBase;
  const total = cif + customsDuty + ciss + etls + surcharge + extraLevy + vat;

  const lines: LandedCostLine[] = [
    { label: "CIF value", amount: cif, amountNgn: toNgn(cif) },
    {
      label: "Customs duty",
      rate: input.dutyRate,
      amount: customsDuty,
      amountNgn: toNgn(customsDuty),
    },
    { label: "CISS (4% of FOB)", rate: 4, amount: ciss, amountNgn: toNgn(ciss) },
    {
      label: "ETLS (0.5% of CIF)",
      rate: 0.5,
      amount: etls,
      amountNgn: toNgn(etls),
    },
    {
      label: "Surcharge (7% of duty)",
      rate: 7,
      amount: surcharge,
      amountNgn: toNgn(surcharge),
    },
  ];

  if (extraLevyRate > 0) {
    lines.push({
      label: "Special levy",
      rate: extraLevyRate,
      amount: extraLevy,
      amountNgn: toNgn(extraLevy),
    });
  }

  lines.push({ label: "VAT", rate: vatRate, amount: vat, amountNgn: toNgn(vat) });

  return {
    cif,
    customsDuty,
    ciss,
    etls,
    surcharge,
    extraLevy,
    vat,
    total,
    totalNgn: exchangeRate === undefined ? total : total * exchangeRate,
    lines,
  };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function normalizeHsCode(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export async function getTariffForHsCode(
  hsCode: string,
  country: string,
): Promise<TariffInfo | null> {
  const normalized = normalizeHsCode(hsCode);
  if (normalized.length < 4) {
    return null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase: SupabaseClient = await createClient();

  const candidates: string[] = [];
  for (let length = normalized.length; length >= 4; length -= 1) {
    candidates.push(normalized.slice(0, length));
  }

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("tariffs")
      .select("duty_rate, vat_rate, levies, source_url")
      .eq("country", country)
      .eq("hs_code", candidate)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      const row = data as {
        duty_rate: number | string | null;
        vat_rate: number | string | null;
        levies: Record<string, number> | null;
        source_url: string | null;
      };
      return {
        dutyRate: row.duty_rate === null ? 0 : Number(row.duty_rate),
        vatRate: row.vat_rate === null ? 7.5 : Number(row.vat_rate),
        levies: row.levies ?? {},
        sourceUrl: row.source_url,
      };
    }
  }

  return null;
}
