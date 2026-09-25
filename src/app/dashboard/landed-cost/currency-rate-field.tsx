"use client";

import { useState } from "react";
import type { LatestFxRate } from "@/lib/fx";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP", "CNY"] as const;

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export function CurrencyRateField({
  rates,
  defaultCurrency,
  defaultExchangeRate,
}: {
  rates: LatestFxRate[];
  defaultCurrency: string;
  defaultExchangeRate: string;
}) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState(defaultExchangeRate);

  const rate = rates.find((entry) => entry.currency === currency) ?? null;

  function handleCurrencyChange(next: string): void {
    setCurrency(next);
    if (next === "NGN") {
      setExchangeRate("1");
      return;
    }
    const nextRate = rates.find((entry) => entry.currency === next);
    if (nextRate) {
      setExchangeRate(String(nextRate.rateNgn));
    }
  }

  return (
    <>
      <div>
        <label htmlFor="currency" className={labelClass}>
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={(event) => handleCurrencyChange(event.target.value)}
          className={`${inputClass} font-mono uppercase`}
        >
          {CURRENCIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
          value={exchangeRate}
          onChange={(event) => setExchangeRate(event.target.value)}
          placeholder="1"
          className={`${inputClass} font-mono`}
        />
        {rate ? (
          <p className="mt-1 font-mono text-xs text-muted">
            NCS rate: {currency} 1 = NGN{" "}
            {rate.rateNgn.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            (effective {rate.effectiveDate})
          </p>
        ) : currency === "NGN" ? (
          <p className="mt-1 font-mono text-xs text-muted">
            Base currency. Rate is 1.
          </p>
        ) : (
          <p className="mt-1 font-mono text-xs text-muted">
            No stored rate for {currency}. Enter one manually.
          </p>
        )}
      </div>
    </>
  );
}
