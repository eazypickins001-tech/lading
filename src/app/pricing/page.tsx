import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PLANS } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple plans in Naira for Nigerian importers, exporters, and trade agents. Start free, upgrade when you ship more, and cancel at any time.",
};

const faqs = [
  {
    question: "How do I pay?",
    answer:
      "All plans are billed in Nigerian Naira (NGN) through Paystack. You can pay by debit card, bank transfer, or USSD, and you receive a receipt by email after each successful payment.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. There is no lock-in. You can cancel from your billing page whenever you like, and your plan stays active until the end of the period you have already paid for.",
  },
  {
    question: "What does the free plan include?",
    answer:
      "The free plan lets one user create up to 3 shipments and 10 documents per month. It is a full working workspace, so you can try the document set and consistency checks before you pay.",
  },
  {
    question: "What counts as a document?",
    answer:
      "Each generated file counts as one document, for example a commercial invoice, packing list, proforma, or certificate of origin. Regenerating a document for the same shipment does not use another credit.",
  },
];

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingPage() {
  const plans = Object.values(PLANS);

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Pricing
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-deep-harbor md:text-4xl">
            Pay for the shipments you actually run.
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            Every plan includes the core document set, the requirement engine,
            and consistency checks. Start free, then move up as your volume
            grows. Prices are in Naira and billed monthly.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-xl border bg-white p-6 ${
                  plan.highlight
                    ? "border-signal-teal shadow-sm"
                    : "border-hairline"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-deep-harbor">
                    {plan.name}
                  </h2>
                  {plan.highlight ? (
                    <span className="rounded-full bg-manifest-amber/15 px-3 py-1 font-mono text-xs uppercase tracking-widest text-manifest-amber">
                      Popular
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-3xl font-semibold text-deep-harbor">
                  {plan.priceNgn === 0 ? "Free" : formatNgn(plan.priceNgn)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {plan.priceNgn === 0 ? "No card required" : "per month"}
                </p>

                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
                  {plan.shipmentsPerMonth} shipments · {plan.documentsPerMonth}{" "}
                  documents · {plan.users} {plan.users === 1 ? "user" : "users"}
                </p>

                <ul className="mt-6 flex-1 space-y-3 text-sm text-ink">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-signal-teal">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`mt-6 rounded-md px-4 py-2 text-center font-medium ${
                    plan.highlight
                      ? "bg-signal-teal text-white hover:bg-signal-teal/90"
                      : "border border-hairline text-deep-harbor hover:bg-cloud"
                  }`}
                >
                  {plan.priceNgn === 0 ? "Start free" : `Choose ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-signal-teal hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>

        <section className="border-t border-hairline bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight text-deep-harbor">
              Billing questions
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-hairline bg-cloud p-6"
                >
                  <h3 className="font-semibold text-deep-harbor">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-deep-harbor text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to start?
              </h2>
              <p className="mt-2 text-white/70">
                Create an account and run your first shipment free.
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-md bg-signal-teal px-6 py-3 font-medium text-white hover:bg-signal-teal/90"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
