"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Incoterm } from "@/lib/shipments";
import { createShipmentAction } from "../actions";

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

export function ShipmentForm({ incoterms }: { incoterms: Incoterm[] }) {
  const [state, action, pending] = useActionState(
    createShipmentAction,
    undefined,
  );
  const [items, setItems] = useState<LineItem[]>(() => [emptyItem()]);

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

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={action} className="space-y-8">
      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">Shipment</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reference" className={labelClass}>
              Reference
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="NG-IMP-0042"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="channel" className={labelClass}>
              Channel
            </label>
            <select id="channel" name="channel" defaultValue="import" className={inputClass}>
              <option value="import">Import</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label htmlFor="originCountry" className={labelClass}>
              Origin country
            </label>
            <input
              id="originCountry"
              name="originCountry"
              type="text"
              placeholder="CN"
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
            <input
              id="destinationCountry"
              name="destinationCountry"
              type="text"
              placeholder="NG"
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
            <label htmlFor="mode" className={labelClass}>
              Transport mode
            </label>
            <select id="mode" name="mode" defaultValue="sea" className={inputClass}>
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
              defaultValue="NGN"
              className={`${inputClass} font-mono uppercase`}
            />
          </div>

          <div>
            <label htmlFor="incoterm" className={labelClass}>
              Incoterm
            </label>
            <select id="incoterm" name="incoterm" defaultValue="" className={inputClass}>
              <option value="">Not set</option>
              {incoterms.map((incoterm) => (
                <option key={incoterm.code} value={incoterm.code}>
                  {incoterm.code} - {incoterm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incotermPlace" className={labelClass}>
              Incoterm place
            </label>
            <input
              id="incotermPlace"
              name="incotermPlace"
              type="text"
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
                  <label className={labelClass}>HS code</label>
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
                  <label className={labelClass}>Net weight (kg)</label>
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
                  <label className={labelClass}>Gross weight (kg)</label>
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
          {pending ? "Creating..." : "Create shipment"}
        </button>
        <Link
          href="/dashboard/shipments"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
