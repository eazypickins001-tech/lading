import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { InfoTip } from "@/components/info-tip";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateLandedCost,
  formatMoney,
  getTariffForHsCode,
  type LandedCostBreakdown,
} from "@/lib/landed-cost";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

const lineTips: Record<string, string> = {
  "CIF value":
    "Cost, Insurance and Freight: the FOB value plus international freight and insurance. Customs duty and ETLS are charged on this base.",
  "CISS (4% of FOB)":
    "Comprehensive Import Supervision Scheme levy of 4% of the FOB value.",
  "ETLS (0.5% of CIF)":
    "ECOWAS Trade Liberalisation Scheme levy of 0.5% of the CIF value.",
  "Surcharge (7% of duty)":
    "A 7% surcharge applied on the assessed customs duty.",
  VAT: "Value Added Tax, charged at the destination rate (7.5% in Nigeria) on the CIF value plus duties and levies.",
};

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined, fallback = 0): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function totalLevyRate(levies: Record<string, number>): number {
  return Object.values(levies).reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
}

export default async function LandedCostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const hasQuery = Object.keys(params).length > 0;

  const hsCode = single(params.hsCode) ?? "";
  const fob = toNumber(single(params.fob));
  const freight = toNumber(single(params.freight));
  const insurance = toNumber(single(params.insurance));
  const currency = (single(params.currency) ?? "NGN").toUpperCase();
  const exchangeRate = toNumber(single(params.exchangeRate), 1);

  let breakdown: LandedCostBreakdown | null = null;
  let dutyRate = 0;
  let vatRate = 7.5;
  let usedFallback = false;
  let sourceUrl: string | null = null;

  if (hasQuery) {
    const tariff =
      hsCode.trim() === "" ? null : await getTariffForHsCode(hsCode, "NG");
    if (tariff) {
      dutyRate = tariff.dutyRate;
      vatRate = tariff.vatRate;
      sourceUrl = tariff.sourceUrl;
      breakdown = calculateLandedCost({
        fob,
        freight,
        insurance,
        dutyRate,
        extraLevyRate: totalLevyRate(tariff.levies),
        vatRate,
        exchangeRate,
      });
    } else {
      dutyRate = 20;
      usedFallback = true;
      breakdown = calculateLandedCost({
        fob,
        freight,
        insurance,
        dutyRate,
        vatRate,
        exchangeRate,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="landedCost" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Duty and cost
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Landed cost calculator
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Estimate the duties, levies and VAT payable on a Nigeria import from a
          CIF value.
        </p>

        <form
          method="get"
          action="/dashboard/landed-cost"
          className="mt-8 rounded-xl border border-hairline bg-white p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="hsCode" className={labelClass}>
                  HS code
                </label>
                <InfoTip label="About the HS code">
                  The Harmonized System code classifies the goods. Lading uses
                  it to find the applicable duty and VAT rates.
                </InfoTip>
              </div>
              <input
                id="hsCode"
                name="hsCode"
                type="text"
                defaultValue={hsCode}
                placeholder="847130"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="fob" className={labelClass}>
                FOB value
              </label>
              <input
                id="fob"
                name="fob"
                type="number"
                min="0"
                step="any"
                defaultValue={single(params.fob) ?? ""}
                placeholder="1000000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="freight" className={labelClass}>
                Freight
              </label>
              <input
                id="freight"
                name="freight"
                type="number"
                min="0"
                step="any"
                defaultValue={single(params.freight) ?? ""}
                placeholder="100000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="insurance" className={labelClass}>
                Insurance
              </label>
              <input
                id="insurance"
                name="insurance"
                type="number"
                min="0"
                step="any"
                defaultValue={single(params.insurance) ?? ""}
                placeholder="10000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="currency" className={labelClass}>
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                type="text"
                defaultValue={currency}
                placeholder="NGN"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>
            <div>
              <label htmlFor="exchangeRate" className={labelClass}>
                Exchange rate to NGN
              </label>
              <input
                id="exchangeRate"
                name="exchangeRate"
                type="number"
                min="0"
                step="any"
                defaultValue={single(params.exchangeRate) ?? "1"}
                placeholder="1"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Estimate landed cost
          </button>
        </form>

        {breakdown ? (
          <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
                Estimate
              </h2>
              <p className="font-mono text-xs text-muted">
                Duty rate {dutyRate}% · VAT {vatRate}%
              </p>
            </div>

            {usedFallback ? (
              <p className="mt-4 rounded-md border border-hairline bg-cloud px-4 py-3 text-sm text-warning">
                No stored tariff was found for this HS code and country. A
                fallback duty rate of 20% is shown and may not reflect the
                actual rate.
              </p>
            ) : null}

            <div className="mt-5 overflow-hidden rounded-lg border border-hairline">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                    <th className="px-5 py-3 font-medium">Line</th>
                    <th className="px-5 py-3 text-right font-medium">Rate</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Amount ({currency})
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Amount (NGN)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.lines.map((line) => (
                    <tr
                      key={line.label}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="px-5 py-3 text-ink">
                        <span className="inline-flex items-center gap-1.5">
                          {line.label}
                          {lineTips[line.label] ? (
                            <InfoTip label={`About ${line.label}`}>
                              {lineTips[line.label]}
                            </InfoTip>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-muted">
                        {line.rate === undefined ? "-" : `${line.rate}%`}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-ink">
                        {formatMoney(line.amount, currency)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-ink">
                        {line.amountNgn === undefined
                          ? "-"
                          : formatMoney(line.amountNgn, "NGN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-hairline bg-cloud">
                    <td className="px-5 py-3 font-medium text-deep-harbor">
                      Total landed cost
                    </td>
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3 text-right font-mono font-semibold text-deep-harbor">
                      {formatMoney(breakdown.total, currency)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-deep-harbor">
                      {formatMoney(breakdown.totalNgn, "NGN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-4 text-sm text-muted">
              These figures are estimates for planning only. Actual assessments
              are made by Nigeria Customs Service and may differ.{" "}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  className="text-signal-teal hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Reference source
                </a>
              ) : null}
            </p>
          </section>
        ) : (
          <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Estimate
            </h2>
            <p className="mt-2 text-sm text-muted">
              Enter a value and run the calculator to see the landed cost
              breakdown.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
