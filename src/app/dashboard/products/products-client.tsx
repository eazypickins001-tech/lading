"use client";

import { useActionState, useState } from "react";
import type { Product } from "@/lib/products";
import {
  deleteProductAction,
  importProductsAction,
  saveProductAction,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export function ProductsClient({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [saveState, saveAction, savePending] = useActionState(
    saveProductAction,
    undefined,
  );
  const [importState, importAction, importPending] = useActionState(
    importProductsAction,
    undefined,
  );

  const fieldError = (name: string) => saveState?.fieldErrors?.[name];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-deep-harbor">
          {editing ? "Edit product" : "Add product"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveAction}
          className="mt-5 grid gap-4"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />

          <div>
            <label htmlFor="productDescription" className={labelClass}>
              Description
            </label>
            <input
              id="productDescription"
              name="description"
              type="text"
              required
              defaultValue={editing?.description ?? ""}
              className={inputClass}
            />
            {fieldError("description") ? (
              <p className="mt-1 text-xs text-danger">
                {fieldError("description")}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="productHsCode" className={labelClass}>
              HS code
            </label>
            <input
              id="productHsCode"
              name="hsCode"
              type="text"
              defaultValue={editing?.hs_code ?? ""}
              className={`${inputClass} font-mono`}
            />
          </div>

          {saveState?.message ? (
            <p
              className={`text-sm ${
                saveState.status === "success" ? "text-success" : "text-danger"
              }`}
            >
              {saveState.message}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savePending}
              className="rounded-md bg-signal-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
            >
              {savePending
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Add product"}
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
          Paste rows with a header: description, hs_code. Products are matched by
          description.
        </p>
        <form action={importAction} className="mt-5">
          <textarea
            name="csv"
            rows={7}
            placeholder={"description,hs_code"}
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
            {importPending ? "Importing..." : "Import products"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-hairline bg-white p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold text-deep-harbor">Catalog</h2>

        {products.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No products yet. Add one above or import a CSV.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-cloud p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="block truncate font-medium text-ink">
                    {product.description}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-muted">
                    {product.hs_code ?? "No HS code"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(product)}
                    className="text-sm font-medium text-deep-harbor hover:text-signal-teal"
                  >
                    Edit
                  </button>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={product.id} />
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
