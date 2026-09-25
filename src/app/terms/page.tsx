import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Lading.",
};

const EFFECTIVE_DATE = "25 September 2026";
const CONTACT_EMAIL = "support@lading.app";

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-deep-harbor">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted">Effective date: {EFFECTIVE_DATE}</p>

        <div className="mt-6 rounded-xl border border-warning/40 bg-warning/10 p-5">
          <h2 className="text-sm font-semibold text-deep-harbor">
            Important: information is guidance only
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Lading provides trade documentation tools and information for general
            guidance only. It is not legal, customs, tax, or financial advice, and
            it is not a substitute for a licensed customs broker or the relevant
            authority. Classifications, duty rates, document requirements, and
            regulatory data may change and may not be complete or current. You are
            responsible for verifying all information with the relevant customs
            authority or a licensed broker before shipping. You remain liable for
            the accuracy of any declaration or filing made using our tools.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              1. Acceptance
            </h2>
            <p className="mt-2">
              By accessing or using Lading, you agree to these terms. If you use
              Lading on behalf of an organization, you confirm you are authorized
              to bind that organization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              2. The service
            </h2>
            <p className="mt-2">
              Lading helps you capture shipments, generate documents, determine
              document requirements, screen parties, check consistency, estimate
              landed cost, and manage trade compliance. We may add, change, or
              remove features over time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              3. Accounts
            </h2>
            <p className="mt-2">
              You must provide accurate information, keep your credentials secure,
              and are responsible for activity under your account. You must be
              authorized to enter any data you upload, including third-party
              personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              4. Acceptable use
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Do not use Lading to violate export, sanctions, or customs law.</li>
              <li>Do not upload unlawful, infringing, or malicious content.</li>
              <li>Do not attempt to breach security or access data belonging to another organization.</li>
              <li>Do not resell or misuse the service or its data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              5. Fees and billing
            </h2>
            <p className="mt-2">
              Paid plans are billed in advance and renew automatically until
              cancelled. Prices are shown at checkout. You can cancel at any time;
              access continues to the end of the current period. Except where
              required by law, fees are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              6. Your data and intellectual property
            </h2>
            <p className="mt-2">
              You retain ownership of the data you enter. You grant us a licence to
              process it to provide the service. We own the Lading software,
              branding, and reference data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              7. Third-party data and AI
            </h2>
            <p className="mt-2">
              Regulatory data is aggregated from public and third-party sources and
              may contain errors or lag changes. AI features produce suggestions
              only and can be wrong. You must review all output before relying on
              it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              8. Disclaimer of warranties
            </h2>
            <p className="mt-2">
              The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
              of any kind, express or implied, including fitness for a particular
              purpose and accuracy of data or output.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              9. Limitation of liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, Lading is not liable for
              indirect, incidental, or consequential damages, or for lost profits,
              duties, penalties, demurrage, or cargo delays. Our total liability is
              limited to the fees you paid in the twelve months before the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              10. Termination
            </h2>
            <p className="mt-2">
              We may suspend or terminate access for breach of these terms or to
              protect the service. You may stop using Lading at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              11. Governing law
            </h2>
            <p className="mt-2">
              These terms are governed by the laws of the Federal Republic of
              Nigeria, without regard to conflict of law rules.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              12. Changes and contact
            </h2>
            <p className="mt-2">
              We may update these terms; material changes will be posted here with
              a new effective date. Questions? Email{" "}
              <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
