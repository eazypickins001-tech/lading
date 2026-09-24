import Link from "next/link";
import type { OnboardingState } from "@/lib/onboarding";

type Step = {
  label: string;
  hint: string;
  href: string;
  done: boolean;
};

export function NextSteps({ state }: { state: OnboardingState }) {
  const steps: Step[] = [
    {
      label: "Complete your profile",
      hint: "Add your name and contact details so documents carry the right party.",
      href: "/dashboard/profile",
      done: state.profileComplete,
    },
    {
      label: "Create your first shipment",
      hint: "Capture the corridor and line items once, then reuse them everywhere.",
      href: "/dashboard/shipments/new",
      done: state.hasShipment,
    },
    {
      label: "Check required documents",
      hint: "See what the corridor requires before you ship.",
      href: "/dashboard/requirements",
      done: state.hasRequirements,
    },
    {
      label: "Generate a document and run consistency checks",
      hint: "Generate a document, then run checks to catch issues before submission.",
      href: "/dashboard/shipments",
      done: state.hasDocuments && state.hasChecks,
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) {
    return null;
  }

  return (
    <section className="mt-10 rounded-xl border border-hairline bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Next steps
          </h2>
          <p className="mt-2 text-sm text-muted">
            Finish setup to get the most out of Lading.
          </p>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {completed} of {steps.length} complete
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className="h-full rounded-full bg-signal-teal transition-all"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map((step) => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-start gap-3 rounded-lg border border-hairline px-4 py-3 transition-colors hover:border-signal-teal"
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  step.done
                    ? "bg-success/10 text-success"
                    : "border border-hairline text-muted"
                }`}
              >
                {step.done ? "✓" : ""}
              </span>
              <span>
                <span
                  className={`block text-sm font-medium ${
                    step.done ? "text-muted line-through" : "text-ink"
                  }`}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {step.hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
