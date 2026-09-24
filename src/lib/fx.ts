import { createClient } from "@/lib/supabase/server";

export type LatestFxRate = {
  currency: string;
  rateNgn: number;
  effectiveDate: string;
};

type FxRateRow = {
  currency: string;
  rate_ngn: number | string;
  effective_date: string;
};

export async function getLatestFxRates(): Promise<LatestFxRate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fx_rates")
    .select("currency, rate_ngn, effective_date")
    .order("effective_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  const latest = new Map<string, LatestFxRate>();

  for (const row of data as FxRateRow[]) {
    if (latest.has(row.currency)) {
      continue;
    }

    const rateNgn = Number(row.rate_ngn);
    if (!Number.isFinite(rateNgn)) {
      continue;
    }

    latest.set(row.currency, {
      currency: row.currency,
      rateNgn,
      effectiveDate: row.effective_date,
    });
  }

  return Array.from(latest.values());
}
