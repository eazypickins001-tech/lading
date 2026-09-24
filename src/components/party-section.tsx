"use client";

import { useState } from "react";
import { CountrySelect } from "@/components/country-select";
import type { DocumentParty } from "@/lib/documents/types";
import type { Party, PartyType } from "@/lib/party-types";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export function PartySection({
  role,
  title,
  description,
  parties,
  linkedPartyId,
  linkedParty,
  required,
  fieldError,
}: {
  role: PartyType;
  title: string;
  description: string;
  parties: Party[];
  linkedPartyId: string | null;
  linkedParty: DocumentParty | null;
  required: boolean;
  fieldError: (name: string) => string | undefined;
}) {
  const available = parties.filter((party) => party.type === role);
  const isLinked = Boolean(
    linkedPartyId && available.some((party) => party.id === linkedPartyId),
  );

  const [mode, setMode] = useState<"existing" | "new">(
    isLinked ? "existing" : "new",
  );
  const [selectedId, setSelectedId] = useState(
    isLinked && linkedPartyId ? linkedPartyId : "",
  );

  const nameError = fieldError(`${role}Name`);

  return (
    <section className="rounded-xl border border-hairline bg-white p-6">
      <h2 className="text-lg font-semibold text-deep-harbor">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <input type="hidden" name={`${role}Mode`} value={mode} />

      <div className="mt-5">
        <label htmlFor={`${role}PartyId`} className={labelClass}>
          Select existing
        </label>
        <select
          id={`${role}PartyId`}
          name={`${role}PartyId`}
          value={mode === "existing" ? selectedId : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (value) {
              setSelectedId(value);
              setMode("existing");
            } else {
              setSelectedId("");
              setMode("new");
            }
          }}
          className={inputClass}
        >
          <option value="">New party</option>
          {available.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
              {party.country ? ` (${party.country})` : ""}
            </option>
          ))}
        </select>
      </div>

      {mode === "new" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${role}Name`} className={labelClass}>
              Name{required ? " *" : ""}
            </label>
            <input
              id={`${role}Name`}
              name={`${role}Name`}
              type="text"
              required={required}
              defaultValue={linkedParty?.name ?? ""}
              className={inputClass}
            />
            {nameError ? (
              <p className="mt-1 text-xs text-danger">{nameError}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${role}Address`} className={labelClass}>
              Address
            </label>
            <input
              id={`${role}Address`}
              name={`${role}Address`}
              type="text"
              defaultValue={linkedParty?.address ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${role}Country`} className={labelClass}>
              Country
            </label>
            <CountrySelect
              id={`${role}Country`}
              name={`${role}Country`}
              defaultValue={linkedParty?.country ?? ""}
              placeholder="Search country"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${role}ContactName`} className={labelClass}>
              Contact name
            </label>
            <input
              id={`${role}ContactName`}
              name={`${role}ContactName`}
              type="text"
              defaultValue={linkedParty?.contactName ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${role}ContactEmail`} className={labelClass}>
              Contact email
            </label>
            <input
              id={`${role}ContactEmail`}
              name={`${role}ContactEmail`}
              type="email"
              defaultValue={linkedParty?.contactEmail ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${role}ContactPhone`} className={labelClass}>
              Contact phone
            </label>
            <input
              id={`${role}ContactPhone`}
              name={`${role}ContactPhone`}
              type="tel"
              defaultValue={linkedParty?.contactPhone ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${role}TaxId`} className={labelClass}>
              Tax ID
            </label>
            <input
              id={`${role}TaxId`}
              name={`${role}TaxId`}
              type="text"
              defaultValue={linkedParty?.taxId ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
