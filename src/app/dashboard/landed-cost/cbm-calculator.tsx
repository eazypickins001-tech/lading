"use client";

import { useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { calculateCbm, type CbmMode, type CbmResult } from "@/lib/cbm";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

const MODE_LABELS: Record<CbmMode, string> = {
  sea: "Sea",
  air: "Air",
  courier: "Courier",
};

function toNumber(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function format(value: number, digits: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function CbmCalculator() {
  const [mode, setMode] = useState<CbmMode>("sea");
  const [lengthCm, setLengthCm] = useState("60");
  const [widthCm, setWidthCm] = useState("40");
  const [heightCm, setHeightCm] = useState("40");
  const [quantity, setQuantity] = useState("10");
  const [actualWeightKg, setActualWeightKg] = useState("");

  const result = useMemo<CbmResult | null>(() => {
    const length = toNumber(lengthCm);
    const width = toNumber(widthCm);
    const height = toNumber(heightCm);
    const qty = toNumber(quantity);
    if (
      length === null ||
      width === null ||
      height === null ||
      qty === null
    ) {
      return null;
    }
    return calculateCbm({
      mode,
      lengthCm: length,
      widthCm: width,
      heightCm: height,
      quantity: qty,
      actualWeightKg: toNumber(actualWeightKg) ?? 0,
    });
  }, [mode, lengthCm, widthCm, heightCm, quantity, actualWeightKg]);

  return (
    <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          CBM / chargeable weight
        </h2>
        <InfoTip label="About volumetric weight">
          Carriers charge the greater of actual weight and volumetric weight.
          Volumetric weight converts volume to a weight equivalent: CBM x 167
          for air and CBM x 200 for courier. Sea freight is charged by volume
          (CBM).
        </InfoTip>
      </div>
      <p className="mt-2 text-sm text-muted">
        Work out the cubic volume and the chargeable weight of your cargo.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="cbmMode" className={labelClass}>
            Mode
          </label>
          <select
            id="cbmMode"
            value={mode}
            onChange={(event) => setMode(event.target.value as CbmMode)}
            className={inputClass}
          >
            {(Object.keys(MODE_LABELS) as CbmMode[]).map((option) => (
              <option key={option} value={option}>
                {MODE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cbmLength" className={labelClass}>
            Length (cm)
          </label>
          <input
            id="cbmLength"
            type="number"
            min="0"
            step="any"
            value={lengthCm}
            onChange={(event) => setLengthCm(event.target.value)}
            placeholder="60"
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="cbmWidth" className={labelClass}>
            Width (cm)
          </label>
          <input
            id="cbmWidth"
            type="number"
            min="0"
            step="any"
            value={widthCm}
            onChange={(event) => setWidthCm(event.target.value)}
            placeholder="40"
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="cbmHeight" className={labelClass}>
            Height (cm)
          </label>
          <input
            id="cbmHeight"
            type="number"
            min="0"
            step="any"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            placeholder="40"
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="cbmQuantity" className={labelClass}>
            Cartons
          </label>
          <input
            id="cbmQuantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="10"
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="cbmActualWeight" className={labelClass}>
            Actual weight (kg)
          </label>
          <input
            id="cbmActualWeight"
            type="number"
            min="0"
            step="any"
            value={actualWeightKg}
            onChange={(event) => setActualWeightKg(event.target.value)}
            placeholder="Optional"
            className={`${inputClass} font-mono`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-cloud p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Volume (CBM)
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-deep-harbor">
            {result ? format(result.cbm, 4) : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-cloud p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Volumetric weight (kg)
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-deep-harbor">
            {result ? format(result.volumetricWeightKg, 3) : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-cloud p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Chargeable weight (kg)
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-deep-harbor">
            {result ? format(result.chargeableWeightKg, 3) : "-"}
          </p>
        </div>
      </div>
    </section>
  );
}
