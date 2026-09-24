"use client";

import { useActionState, useState } from "react";
import { CountrySelect } from "@/components/country-select";
import { PARTY_TYPES, type Party } from "@/lib/party-types";
import {
  deletePartyAction,
  importPartiesAction,
  savePartyAction,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export function PartiesClient({ parties }: { parties: Party[] }) {
  const [editing, setEditing] = useState<Party | null>(null);
  const [saveState, saveAction, savePending] = useActionState(
    savePartyAction,
    undefined,
  );
  const [importState, importAction, importPending] = useActionState(
    importPartiesAction,
    undefined,
  );

  const fieldError = (name: string) => saveState?.fieldErrors?.[name];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">
          {editing ? "Edit contact" : "Add contact"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveAction}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />

          <div>
            <label htmlFor="partyType" className={labelClass}>
              Type
            </label>
            <select
              id="partyType"
              name="type"
              defaultValue={editing?.type ?? "exporter"}
              className={inputClass}
            >
              {PARTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {fieldError("type") ? (
              <p className="mt-1 text-xs text-danger">{fieldError("type")}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="partyName" className={labelClass}>
              Name
            </label>
            <input
              id="partyName"
              name="name"
              type="text"
              required
              defaultValue={editing?.name ?? ""}
              className={inputClass}
            />
            {fieldError("name") ? (
              <p className="mt-1 text-xs text-danger">{fieldError("name")}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="partyAddress" className={labelClass}>
              Address
            </label>
            <input
              id="partyAddress"
              name="address"
              type="text"
              defaultValue={editing?.address ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="partyCountry" className={labelClass}>
              Country
            </label>
            <CountrySelect
              id="partyCountry"
              name="country"
              defaultValue={editing?.country ?? ""}
              placeholder="Search country"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="partyContactName" className={labelClass}>
              Contact name
            </label>
            <input
              id="partyContactName"
              name="contactName"
              type="text"
              defaultValue={editing?.contact_name ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="partyContactEmail" className={labelClass}>
              Contact email
            </label>
            <input
              id="partyContactEmail"
              name="contactEmail"
              type="email"
              defaultValue={editing?.contact_email ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="partyContactPhone" className={labelClass}>
              Contact phone
            </label>
            <input
              id="partyContactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={editing?.contact_phone ?? ""}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="partyTaxId" className={labelClass}>
              Tax ID
            </label>
            <input
              id="partyTaxId"
              name="taxId"
              type="text"
              defaultValue={editing?.tax_id ?? ""}
              className={inputClass}
            />
          </div>

          {saveState?.message ? (
            <p
              className={`sm:col-span-2 text-sm ${
                saveState.status === "success" ? "text-success" : "text-danger"
              }`}
            >
              {saveState.message}
            </p>
          ) : null}

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={savePending}
              className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
            >
              {savePending
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Add contact"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-sm font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">Import CSV</h2>
        <p className="mt-1 text-sm text-muted">
          Paste rows with a header: type, name, address, country, contact_name,
          contact_email, contact_phone, tax_id. Contacts are matched by name and
          type.
        </p>
        <form action={importAction} className="mt-5">
          <textarea
            name="csv"
            rows={7}
            placeholder={
              "type,name,address,country,contact_name,contact_email,contact_phone,tax_id"
            }
            className={`${inputClass} font-mono`}
          />
          {importState?.message ? (
            <p
              className={`mt-2 text-sm ${
                importState.status === "success"
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {importState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={importPending}
            className="mt-4 rounded-md border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:bg-cloud disabled:opacity-60"
          >
            {importPending ? "Importing..." : "Import contacts"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold text-deep-harbor">Directory</h2>

        {parties.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No contacts yet. Add one above or import a CSV.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {parties.map((party) => (
              <li
                key={party.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-cloud p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-ink">
                      {party.name}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {party.type}
                    </span>
                    {party.country ? (
                      <span className="font-mono text-xs text-muted">
                        {party.country}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">
                    {[party.contact_name, party.contact_email, party.contact_phone]
                      .filter(Boolean)
                      .join(" · ") || "No contact details"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(party)}
                    className="text-sm font-medium text-deep-harbor hover:text-signal-teal"
                  >
                    Edit
                  </button>
                  <form action={deletePartyAction}>
                    <input type="hidden" name="id" value={party.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
