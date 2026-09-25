# Lading - Roadmap

Status of everything shipped, planned, and deliberately deferred. The deferred items need an external account, a partnership, or a separate project.

## Shipped

### Foundation (M0 to M7)
- Schema, RLS, auth, organizations, roles, onboarding, profile.
- Shipments with document generation (invoice, packing list, proforma).
- Requirement engine and consistency validator.
- Landed cost, trade terms, billing (Paystack), admin console.
- Data-sync pipeline with staged human review.
- Marketing site: landing, pricing, SEO resources, sitemap, robots.
- Security hardening (tenant isolation fix, rate limiting, headers, audit trail).

### Competitive parity sprints (A to F)
- **Sprint A**: Contacts directory, products catalog, CSV import, party capture on the shipment form (seller, buyer, notify).
- **Sprint B**: Bill of lading, air waybill, certificate of origin, shipper's letter of instruction, VGM declaration, packing declaration.
- **Sprint C**: Document storage and attachments, company branding (logo, signature, seal), merged document sets, share links, agent access grants, audit trail UI.
- **Sprint D**: Restricted-party screening (US Consolidated Screening List, fuzzy matching, screening page and shipment card).
- **Sprint E**: Shipment status workflow, reports and analytics, in-app notifications, CBM calculator, multi-currency landed cost.
- **Sprint F**: Public API (`/api/v1`) with API keys, and outbound webhooks.

## Next up (short term, no external dependency)

- SMTP configuration so email confirmation, password reset, and notifications deliver.
- Email notifications (extend the in-app notifications to email once SMTP is configured).
- Tariff data expansion: more HS codes and corridors in `tariffs` and `requirement_rules`.
- Real parsers for more data sources (CBN rates, SON, NAFDAC, NEPC) and a licensed or proxied NCS feed.
- UN and EU sanctions lists added to screening (alongside the US CSL).
- OCR / extraction from uploaded documents (bill of lading, invoice, packing list) using a free vision model or a paid OCR provider.
- Template customization: let users tweak field labels and document layouts.
- Reporting expansion: duty and P&L per shipment, agent performance, corridor analytics.

## Deferred (needs an external account, partnership, or legal agreement)

| Item | Why deferred | What is needed |
|---|---|---|
| AES / EEI filing | US Census filing requires an authorized account and agreement | AESDirect / ACE account and certification |
| Chamber-certified Certificate of Origin | Must be issued or validated by a chamber | Partnership with NACCIMA / a chamber certification portal |
| Carrier EDI and eMBL (Bolero) | Requires carrier network agreements | Carrier / WiseTech / Bolero partnership |
| Shipment tracking and visibility | Requires carrier and terminal integrations | Carrier APIs or an aggregator |
| ERP / accounting integrations (Xero, QuickBooks, SAP) | Requires OAuth apps and partner listings | App registration with each provider |
| Online invoice payments (Pay Now on documents) | Needs a payments provider integration per invoice | Paystack/Flutterwave invoice or payment-link API |
| Marketplace and e-commerce integrations | Requires platform partner programs | Amazon, Shopify, Walmart partner accounts |
| Mobile app | Separate project and release pipeline | Dedicated mobile build |

## Ideas backlog (unprioritized)

- Multi-language UI (French, Swahili) for broader African coverage.
- Binding tariff rulings lookup and a curated HS classification library per corridor.
- Free trade agreement (AfCFTA, ECOWAS) rules-of-origin qualification assistant.
- Document versioning and a formal approval workflow with e-signatures.
- Customer-facing tracking portal (white-labelled) for traders and agents.
- Advanced analytics: landed-cost benchmarking, supplier scorecards, tariff-change impact alerts.
- Team management: member invites, seat limits enforced per plan, SSO.
- AI assistant for general trade questions (beyond HS classification).
- Marketplace of pre-built document templates and corridor rule packs.

## How to use this roadmap

- Shipped items are merged to `main` and deployed.
- "Next up" items are ready to build with the current stack and no new accounts.
- "Deferred" items should not be started until the external dependency is in place; they are tracked here to avoid half-built features.
