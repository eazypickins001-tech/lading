import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { InfoTip } from "@/components/info-tip";
import { getCurrentUser } from "@/lib/auth";
import {
  clauseSnippet,
  getTradeTerms,
  recommendTradeTerm,
  type RiskAppetite,
  type TradeTerm,
} from "@/lib/trade-terms";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

const modeOptions = [
  { value: "sea", label: "Sea" },
  { value: "air", label: "Air" },
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
  { value: "courier", label: "Courier" },
  { value: "multimodal", label: "Multimodal" },
];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function humanize(value: string): string {
  if (value.trim() === "") {
    return "-";
  }
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function partyLabel(party: string): string {
  return party === "seller" ? "Seller" : "Buyer";
}

function insuranceLabel(insurance: string): string {
  return insurance === "seller_required" ? "Seller" : "Not required";
}

export default async function TradeTermsPage({
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

  const terms = await getTradeTerms();
  const termsByCode = new Map<string, TradeTerm>(
    terms.map((term) => [term.code, term]),
  );

  const mode = single(params.mode) ?? "sea";
  const preferSellerControlsFreight =
    single(params.preferFreight) === "true";
  const sellerProvidesInsurance = single(params.sellerInsurance) === "true";
  const riskAppetite: RiskAppetite =
    single(params.riskAppetite) === "low" ||
    single(params.riskAppetite) === "high"
      ? (single(params.riskAppetite) as RiskAppetite)
      : "medium";
  const place = single(params.place) ?? "Lagos";

  const recommendations = hasQuery
    ? recommendTradeTerm({
        mode,
        preferSellerControlsFreight,
        sellerProvidesInsurance,
        riskAppetite,
      })
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="tradeTerms" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Contract support
        </p>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Trade terms
          </h1>
          <InfoTip label="About trade terms">
            These are the ICC Incoterms 2020 rules. They define delivery,
            risk, and cost responsibilities between buyer and seller, but they
            do not cover payment, title, or product quality.
          </InfoTip>
        </div>
        <p className="mt-2 max-w-2xl text-muted">
          Compare the eleven Incoterms 2020 rules and get a recommendation for
          your shipment.
        </p>

        <form
          method="get"
          action="/dashboard/trade-terms"
          className="mt-8 rounded-xl border border-hairline bg-white p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="mode" className={labelClass}>
                Transport mode
              </label>
              <select
                id="mode"
                name="mode"
                defaultValue={mode}
                className={inputClass}
              >
                {modeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="riskAppetite" className={labelClass}>
                Risk appetite
              </label>
              <select
                id="riskAppetite"
                name="riskAppetite"
                defaultValue={riskAppetite}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="place" className={labelClass}>
                Place
              </label>
              <input
                id="place"
                name="place"
                type="text"
                defaultValue={place}
                placeholder="Lagos"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="preferFreight"
                  value="true"
                  defaultChecked={preferSellerControlsFreight}
                  className="h-4 w-4 rounded border-hairline accent-signal-teal"
                />
                Seller controls freight
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="sellerInsurance"
                  value="true"
                  defaultChecked={sellerProvidesInsurance}
                  className="h-4 w-4 rounded border-hairline accent-signal-teal"
                />
                Seller provides insurance
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Recommend a term
          </button>
        </form>

        {hasQuery ? (
          <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Recommendations
            </h2>
            <ul className="mt-5 space-y-4">
              {recommendations.map((recommendation) => {
                const term = termsByCode.get(recommendation.code);
                return (
                  <li
                    key={recommendation.code}
                    className="rounded-lg border border-hairline bg-cloud p-5"
                  >
                    <p className="font-mono text-sm font-semibold text-deep-harbor">
                      {recommendation.code}
                      {term ? ` · ${term.name}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-ink">
                      {recommendation.rationale}
                    </p>
                    {term ? (
                      <p className="mt-3 font-mono text-xs text-muted">
                        Clause: {clauseSnippet(term, place)}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Suggested wording is descriptive only and does not imply any
              endorsement. Confirm the final term with your counterparty.
            </p>
          </section>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-xl border border-hairline bg-white">
          <div className="flex items-center gap-2 border-b border-hairline px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Incoterms 2020 comparison
            </h2>
            <InfoTip label="About the comparison">
              Mode shows where the rule can be used. Risk transfer is the point
              where risk passes from seller to buyer.
            </InfoTip>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-widest text-muted">
                  <th className="px-5 py-3 font-medium">Term</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium">Risk transfer</th>
                  <th className="px-5 py-3 font-medium">Carriage</th>
                  <th className="px-5 py-3 font-medium">Export</th>
                  <th className="px-5 py-3 font-medium">Import</th>
                  <th className="px-5 py-3 font-medium">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr
                    key={term.code}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-deep-harbor">
                        {term.code}
                      </span>
                      <span className="block text-xs text-muted">
                        {term.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {term.modeScope.map(humanize).join(", ")}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {humanize(term.riskTransfer)}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {partyLabel(term.mainCarriage)}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {partyLabel(term.exportClearance)}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {partyLabel(term.importClearance)}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {insuranceLabel(term.insurance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
