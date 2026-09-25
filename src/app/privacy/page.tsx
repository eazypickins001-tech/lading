import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Lading collects, uses, stores, and protects your information.",
};

const EFFECTIVE_DATE = "25 September 2026";
const CONTACT_EMAIL = "support@lading.app";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-deep-harbor">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Effective date: {EFFECTIVE_DATE}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">1. Who we are</h2>
            <p className="mt-2">
              Lading provides trade documentation and compliance tools for
              importers, exporters, and clearing agents. This policy explains what
              information we collect, why, and how we handle it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              2. Information we collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Account information: name, email address, phone number, country,
                organization name, and role.
              </li>
              <li>
                Trade data you enter: shipments, parties (shippers, consignees,
                agents), products, HS codes, values, weights, documents, and
                messages you generate.
              </li>
              <li>
                Files you upload, including documents, logos, signatures, and
                seals.
              </li>
              <li>
                Usage and technical data: pages viewed, actions taken, IP address,
                browser type, and timestamps, used for security and to operate the
                service.
              </li>
              <li>
                Payment information processed by our payment providers. We do not
                store full card numbers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              3. How we use information
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To provide, operate, and improve the service.</li>
              <li>To generate documents and compliance information you request.</li>
              <li>To authenticate users and keep accounts secure.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To send service messages and, where permitted, product updates.</li>
              <li>To comply with legal obligations and enforce our terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              4. AI features
            </h2>
            <p className="mt-2">
              Some features use third-party AI models to suggest HS codes or
              generate text. Text you submit to those features may be sent to the
              model provider for processing. Do not submit information you are not
              permitted to share.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              5. Sharing
            </h2>
            <p className="mt-2">
              We share information with service providers who help us run Lading
              (hosting, database, payments, AI, email), with parties you choose to
              share a shipment with, and where required by law. We do not sell your
              personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              6. Data location and security
            </h2>
            <p className="mt-2">
              Data is stored with our cloud providers. We use encryption in
              transit, row-level access controls, and least-privilege access to
              protect your information. No system is completely secure, so we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              7. Retention
            </h2>
            <p className="mt-2">
              We keep information while your account is active and for as long as
              needed to provide the service, meet legal obligations, resolve
              disputes, and enforce agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              8. Your rights
            </h2>
            <p className="mt-2">
              Depending on your location, you may have the right to access,
              correct, export, or delete your information, or to object to certain
              processing. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">9. Cookies</h2>
            <p className="mt-2">
              We use cookies and similar technologies for authentication and to
              keep you signed in. You can control cookies in your browser, but some
              features may not work without them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              10. Changes
            </h2>
            <p className="mt-2">
              We may update this policy. Material changes will be posted here with
              a new effective date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-deep-harbor">
              11. Contact
            </h2>
            <p className="mt-2">
              Questions about this policy? Email{" "}
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
