"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { CountrySelect } from "@/components/country-select";
import { InfoTip } from "@/components/info-tip";
import type { HsSuggestion } from "@/lib/hs-suggest";
import type { Incoterm, ShipmentItem, ShipmentWithItems } from "@/lib/shipments";
import { suggestHsForLineAction, updateShipmentAction } from "../../actions";

type LineItem = {
  key: string;
  description: string;
  hsCode: string;
  quantity: string;
  unit: string;
  unitValue: string;
  netWeight: string;
  grossWeight: string;
};

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";
const cellClass =
  "w-full rounded-md border border-hairline bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";

const confidenceStyles: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-cloud text-muted",
};

let rowCounter = 0;

function emptyItem(): LineItem {
  rowCounter += 1;
  return {
    key: `row-${rowCounter}`,
    description: "",
    hsCode: "",
    quantity: "1",
    unit: "unit",
    unitValue: "",
    netWeight: "",
    grossWeight: "",
  };
}

function toLineItem(item: ShipmentItem): LineItem {
  return {
    key: `item-${item.id}`,
    description: item.description,
    hsCode: item.hs_code ?? "",
    quantity: String(item.quantity),
    unit: item.unit,
    unitValue: String(item.unit_value),
    netWeight: item.net_weight_kg === null ? "" : String(item.net_weight_kg),
    grossWeight:
      item.gross_weight_kg === null ? "" : String(item.gross_weight_kg),
  };
}

export function EditShipmentForm({
  shipment,
  incoterms,
}: {
  shipment: ShipmentWithItems;
  incoterms: Incoterm[];
}) {
  const [state, action, pending] = useActionState(
    updateShipmentAction,
    undefined,
  );
  const [items, setItems] = useState<LineItem[]>(() =>
    shipment.items.length > 0
      ? shipment.items.map(toLineItem)
      : [emptyItem()],
  );
  const [hsSuggestions, setHsSuggestions] = useState<
    Record<string, HsSuggestion[]>
  >({});
  const [hsLoadingKey, setHsLoadingKey] = useState<string | null>(null);
  const [hsErrors, setHsErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    setItems((current) => [...current, emptyItem()]);
  };

  const removeItem = (key: string) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((item) => item.key !== key),
    );
  };

  const handleSuggestHs = async (item: LineItem) => {
    if (!item.description.trim()) {
      setHsErrors((current) => ({
        ...current,
        [item.key]: "Enter a description first.",
      }));
      return;
    }

    setHsLoadingKey(item.key);
    setHsErrors((current) => {
      const next = { ...current };
      delete next[item.key];
      return next;
    });

    const formData = new FormData();
    formData.set("description", item.description);
    const destination = formRef.current
      ? String(
          new FormData(formRef.current).get("destinationCountry") ?? "NG",
        )
      : "NG";
    formData.set("destination", destination.trim() || "NG");

    try {
      const result = await suggestHsForLineAction(formData);
      if (result.status === "success") {
        setHsSuggestions((current) => ({
          ...current,
          [item.key]: result.suggestions,
        }));
      } else {
        setHsErrors((current) => ({
          ...current,
          [item.key]: result.message,
        }));
      }
    } finally {
      setHsLoadingKey(null);
    }
  };

  const applySuggestion = (key: string, code: string) => {
    updateItem(key, { hsCode: code });
    setHsSuggestions((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form ref={formRef} action={action} className="space-y-8">
      <input type="hidden" name="shipmentId" value={shipment.id} />

      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">Shipment</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="reference" className={labelClass}>
                Reference
              </label>
              <InfoTip label="About the reference">
                Leave this blank to keep the current reference, for example
                IMP-2026-0001. Type your own to override it.
              </InfoTip>
            </div>
            <input
              id="reference"
              name="reference"
              type="text"
              defaultValue={shipment.reference ?? ""}
              placeholder="Auto-generated"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="channel" className={labelClass}>
                Channel
              </label>
              <InfoTip label="About the channel">
                Import brings goods into the destination country; export sends
                them out. This changes which documents apply.
              </InfoTip>
            </div>
            <select
              id="channel"
              name="channel"
              defaultValue={shipment.channel}
              className={inputClass}
            >
              <option value="import">Import</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label htmlFor="originCountry" className={labelClass}>
              Origin country
            </label>
            <CountrySelect
              id="originCountry"
              name="originCountry"
              defaultValue={shipment.origin_country}
              placeholder="Search country"
              required
              className={inputClass}
            />
            {fieldError("originCountry") ? (
              <p className="mt-1 text-xs text-danger">
                {fieldError("originCountry")}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="destinationCountry" className={labelClass}>
              Destination country
            </label>
            <CountrySelect
              id="destinationCountry"
              name="destinationCountry"
              defaultValue={shipment.destination_country}
              placeholder="Search country"
              required
              className={inputClass}
            />
            {fieldError("destinationCountry") ? (
              <p className="mt-1 text-xs text-danger">
                {fieldError("destinationCountry")}
              </p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="mode" className={labelClass}>
                Transport mode
              </label>
              <InfoTip label="About the transport mode">
                How the goods travel. Sea uses a bill of lading, air uses an
                airway bill.
              </InfoTip>
            </div>
            <select
              id="mode"
              name="mode"
              defaultValue={shipment.mode}
              className={inputClass}
            >
              <option value="sea">Sea</option>
              <option value="air">Air</option>
              <option value="road">Road</option>
              <option value="rail">Rail</option>
              <option value="courier">Courier</option>
              <option value="multimodal">Multimodal</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Currency
            </label>
            <input
              id="currency"
              name="currency"
              type="text"
              defaultValue={shipment.currency}
              className={`${inputClass} font-mono uppercase`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="incoterm" className={labelClass}>
                Incoterm
              </label>
              <InfoTip label="About Incoterms">
                The trade term that sets who pays costs and carries risk, for
                example FOB or CIF.
              </InfoTip>
            </div>
            <select
              id="incoterm"
              name="incoterm"
              defaultValue={shipment.incoterm ?? ""}
              className={inputClass}
            >
              <option value="">Not set</option>
              {incoterms.map((incoterm) => (
                <option key={incoterm.code} value={incoterm.code}>
                  {incoterm.code} - {incoterm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="incotermPlace" className={labelClass}>
                Incoterm place
              </label>
              <InfoTip label="About the Incoterm place">
                The named place or port the Incoterm applies to, for example
                Lagos or Apapa.
              </InfoTip>
            </div>
            <input
              id="incotermPlace"
              name="incotermPlace"
              type="text"
              defaultValue={shipment.incoterm_place ?? ""}
              placeholder="Lagos"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-deep-harbor">Line items</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-cloud"
          >
            Add row
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.key}
              className="rounded-lg border border-hairline bg-cloud p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length === 1}
                  className="text-xs font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Description</label>
                  <input
                    name="itemDescription"
                    type="text"
                    value={item.description}
                    onChange={(event) =>
                      updateItem(item.key, { description: event.target.value })
                    }
                    placeholder="Cocoa beans, raw"
                    className={cellClass}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className={labelClass}>HS code</label>
                      <InfoTip label="About the HS code">
                        The customs classification code for the product, used to
                        look up duties and document rules.
                      </InfoTip>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSuggestHs(item)}
                      disabled={hsLoadingKey === item.key}
                      className="rounded-md border border-hairline px-2 py-1 text-xs font-medium text-ink hover:bg-white disabled:opacity-60"
                    >
                      {hsLoadingKey === item.key ? "Thinking..." : "Suggest"}
                    </button>
                  </div>
                  <input
                    name="itemHsCode"
                    type="text"
                    value={item.hsCode}
                    onChange={(event) =>
                      updateItem(item.key, { hsCode: event.target.value })
                    }
                    placeholder="1801.00"
                    className={`${cellClass} font-mono`}
                  />
                  {hsErrors[item.key] ? (
                    <p className="mt-1 text-xs text-danger">
                      {hsErrors[item.key]}
                    </p>
                  ) : null}
                  {hsSuggestions[item.key]?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {hsSuggestions[item.key].slice(0, 3).map((suggestion) => (
                        <button
                          key={`${item.key}-${suggestion.code}-${suggestion.description}`}
                          type="button"
                          onClick={() =>
                            applySuggestion(item.key, suggestion.code)
                          }
                          className="flex max-w-full items-center gap-1.5 rounded-full border border-hairline bg-white px-2.5 py-1 text-left text-xs text-ink hover:border-signal-teal"
                        >
                          <span className="font-mono font-semibold text-deep-harbor">
                            {suggestion.code}
                          </span>
                          <span className="truncate text-muted">
                            {suggestion.description}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${confidenceStyles[suggestion.confidence]}`}
                          >
                            {suggestion.confidence}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Unit</label>
                  <input
                    name="itemUnit"
                    type="text"
                    value={item.unit}
                    onChange={(event) =>
                      updateItem(item.key, { unit: event.target.value })
                    }
                    className={cellClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    name="itemQuantity"
                    type="number"
                    min="0"
                    step="any"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.key, { quantity: event.target.value })
                    }
                    className={`${cellClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit value</label>
                  <input
                    name="itemUnitValue"
                    type="number"
                    min="0"
                    step="any"
                    value={item.unitValue}
                    onChange={(event) =>
                      updateItem(item.key, { unitValue: event.target.value })
                    }
                    placeholder="0.00"
                    className={`${cellClass} font-mono`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <label className={labelClass}>Net weight (kg)</label>
                    <InfoTip label="About net weight">
                      The weight of the goods alone, without packaging.
                    </InfoTip>
                  </div>
                  <input
                    name="itemNetWeight"
                    type="number"
                    min="0"
                    step="any"
                    value={item.netWeight}
                    onChange={(event) =>
                      updateItem(item.key, { netWeight: event.target.value })
                    }
                    className={`${cellClass} font-mono`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <label className={labelClass}>Gross weight (kg)</label>
                    <InfoTip label="About gross weight">
                      The weight of the goods plus packaging, used on the
                      packing list.
                    </InfoTip>
                  </div>
                  <input
                    name="itemGrossWeight"
                    type="number"
                    min="0"
                    step="any"
                    value={item.grossWeight}
                    onChange={(event) =>
                      updateItem(item.key, { grossWeight: event.target.value })
                    }
                    className={`${cellClass} font-mono`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {fieldError("items") ? (
          <p className="mt-3 text-sm text-danger">{fieldError("items")}</p>
        ) : null}
      </section>

      {state?.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-signal-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        <Link
          href={`/dashboard/shipments/${shipment.id}`}
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
