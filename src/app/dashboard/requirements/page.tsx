import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { InfoTip } from "@/components/info-tip";
import { RequiredDocumentsList } from "@/components/required-documents";
import { getCurrentUser } from "@/lib/auth";
import type { TradeChannel } from "@/lib/documents/types";
import { getRequiredDocuments, type RequiredDocument } from "@/lib/requirements";
import { HsAssistant } from "./hs-assistant";

const attributeOptions = [
  {
    name: "plant_products",
    label: "Plant products",
    tip: "Select for plants or plant products, which can trigger phytosanitary certificates.",
  },
  {
    name: "food_drugs_cosmetics",
    label: "Food, drugs and cosmetics",
    tip: "Select for food, drugs, or cosmetics that may need NAFDAC or health permits.",
  },
  {
    name: "regulated_products",
    label: "Regulated products",
    tip: "Select when the goods fall under regulated categories with extra permits.",
  },
  {
    name: "preferential_treatment",
    label: "Preferential tariff treatment",
    tip: "Select when claiming reduced tariffs under a trade agreement, which needs a certificate of origin.",
  },
];

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function RequirementsPage({
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
  const originCountry = single(params.originCountry) ?? "NG";
  const destinationCountry = single(params.destinationCountry) ?? "NG";
  const channel: TradeChannel =
    single(params.channel) === "import" ? "import" : "export";

  const attributes: Record<string, boolean> = {};
  for (const option of attributeOptions) {
    if (single(params[option.name]) === "true") {
      attributes[option.name] = true;
    }
  }

  let documents: RequiredDocument[] = [];
  if (hasQuery) {
    documents = await getRequiredDocuments({
      hsCode: hsCode.trim() === "" ? null : hsCode,
      originCountry,
      destinationCountry,
      channel,
      attributes,
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader active="requirements" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Trade compliance
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Requirements checker
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Check which documents a trade corridor requires before you ship.
        </p>

        <HsAssistant />

        <form
          method="get"
          action="/dashboard/requirements"
          className="mt-8 rounded-xl border border-hairline bg-white p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="hsCode" className={labelClass}>
                HS code
              </label>
              <input
                id="hsCode"
                name="hsCode"
                type="text"
                defaultValue={hsCode}
                placeholder="1801.00"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="originCountry" className={labelClass}>
                Origin country
              </label>
              <input
                id="originCountry"
                name="originCountry"
                type="text"
                defaultValue={originCountry}
                placeholder="NG"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>
            <div>
              <label htmlFor="destinationCountry" className={labelClass}>
                Destination country
              </label>
              <input
                id="destinationCountry"
                name="destinationCountry"
                type="text"
                defaultValue={destinationCountry}
                placeholder="NG"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="channel" className={labelClass}>
                  Channel
                </label>
                <InfoTip label="About the channel">
                  Import brings goods into the destination country; export
                  sends them out. This changes which documents apply.
                </InfoTip>
              </div>
              <select
                id="channel"
                name="channel"
                defaultValue={channel}
                className={inputClass}
              >
                <option value="export">Export</option>
                <option value="import">Import</option>
              </select>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-ink">
              Product attributes
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {attributeOptions.map((option) => (
                <div
                  key={option.name}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={option.name}
                      value="true"
                      defaultChecked={attributes[option.name] === true}
                      className="h-4 w-4 rounded border-hairline accent-signal-teal"
                    />
                    {option.label}
                  </label>
                  <InfoTip label={`About ${option.label}`}>{option.tip}</InfoTip>
                </div>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-6 rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90"
          >
            Check requirements
          </button>
        </form>

        <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Results
          </h2>
          {hasQuery ? (
            <div className="mt-5">
              <RequiredDocumentsList documents={documents} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Enter a corridor above and run the checker to see the documents
              that apply.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
