"use client";

import { useActionState } from "react";
import { saveBrandingAction } from "./actions";

const inputClass =
  "mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-cloud file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:border-signal-teal";
const labelClass = "block text-sm font-medium text-ink";

export type BrandingValues = {
  logoUrl: string | null;
  signatureUrl: string | null;
  sealUrl: string | null;
};

const FIELDS: { name: "logo" | "signature" | "seal"; label: string; hint: string }[] = [
  { name: "logo", label: "Logo", hint: "Shown in the header of every document." },
  {
    name: "signature",
    label: "Signature",
    hint: "Drawn in the signature area of documents.",
  },
  { name: "seal", label: "Seal", hint: "Drawn next to the signature." },
];

export function BrandingForm({ branding }: { branding: BrandingValues }) {
  const [state, action, pending] = useActionState(
    saveBrandingAction,
    undefined,
  );

  const current: Record<string, string | null> = {
    logo: branding.logoUrl,
    signature: branding.signatureUrl,
    seal: branding.sealUrl,
  };

  return (
    <form action={action} className="space-y-6">
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className={labelClass}>
            {field.label}
          </label>
          <p className="mt-1 text-xs text-muted">{field.hint}</p>

          {current[field.name] ? (
            <div className="mt-3 flex items-center gap-4">
              <img
                src={current[field.name] ?? ""}
                alt={`Current ${field.label.toLowerCase()}`}
                className="h-16 w-auto rounded-md border border-hairline bg-white object-contain p-1"
              />
              <span className="text-xs text-muted">Current image</span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">No image uploaded yet.</p>
          )}

          <input
            id={field.name}
            name={field.name}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className={inputClass}
          />
        </div>
      ))}

      {state?.status === "success" ? (
        <p className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      ) : null}

      {state?.status === "error" ? (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-signal-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-signal-teal/90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save branding"}
      </button>
    </form>
  );
}
