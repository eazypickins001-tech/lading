# Lading - Handover Note

Everything a new developer or operator needs to run, deploy, and support Lading.

## 1. What this is

Lading is a trade documentation and compliance platform for importers, exporters, and clearing agents. It captures a shipment once and generates compliant import/export documents, determines required documents and permits, screens parties against restricted-party lists, checks documents for consistency before submission, advises on Incoterms, estimates landed cost, and bills in NGN via Paystack. Primary market: Nigeria, expanding to Rwanda and East Africa.

Tagline: "Every document, right the first time."

## 2. Links

| Item | Value |
|---|---|
| Production | https://lading-eazypickins.vercel.app (alias https://lading-three.vercel.app) |
| Repository | https://github.com/eazypickins001-tech/lading |
| Supabase project | mcervdzebmfzdbrbnesm (region eu-west-2) |
| Hosting | Vercel (project `lading`, team `eazypickins`) |
| Payments | Paystack |
| AI | OpenRouter (free models only) |

## 3. Stack

- Next.js 16.3.6 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4, deployed on Vercel.
- Supabase: Postgres, Auth, Storage. Row Level Security on every table.
- Paystack for billing (NGN). OpenRouter for AI (HS suggestions).
- PDF generation with pdf-lib (no headless browser).

## 4. Run locally

```bash
pnpm install
cp .env.example .env.local   # then fill in values
pnpm dev                     # http://localhost:3000
pnpm lint
pnpm build
```

## 5. Environment variables

Set in `.env.local` for local dev and in Vercel (Production + Preview) for deploys. Never commit real values.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key (server only) |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used for auth and Paystack callbacks |
| `CRON_SECRET` | Shared secret for the Vercel Cron sync route |
| `ADMIN_EMAILS` | Comma-separated platform-owner emails |
| `OPENROUTER_API_KEY` | OpenRouter key |
| `OPENROUTER_MODEL` | Free model id (default `nvidia/nemotron-3-super-120b-a12b:free`) |
| `PAYSTACK_SECRET_KEY` | Paystack secret (server only) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |

## 6. Database

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI using a direct connection string:

```bash
supabase db push --db-url "postgresql://postgres:<PASSWORD>@db.mcervdzebmfzdbrbnesm.supabase.co:5432/postgres" --yes
```

Key tables: `organizations`, `memberships`, `profiles`, `parties`, `products`, `shipments`, `shipment_items`, `shipment_documents`, `shipment_access`, `document_templates`, `hs_codes`, `tariffs`, `incoterms`, `requirement_rules`, `consistency_findings`, `subscriptions`, `usage_counters`, `data_sources`, `source_snapshots`, `staged_changes`, `payment_plans`, `fx_rates`, `platform_admins`, `audit_events`, `rate_limits`, `share_links`, `screening_entries`, `screening_results`, `notifications`, `api_keys`, `webhook_endpoints`, `webhook_deliveries`.

Security model: RLS on every table; org isolation via `is_org_member`, `has_org_role`, `can_access_shipment`, `owns_shipment`; reference data read-only; writes to reference/sync tables via the service role. See `docs/architecture.md`.

## 7. Access

Platform admin console: `/admin` (users, organizations, subscriptions, user editing). Access is gated by `ADMIN_EMAILS`. The data-sync console is at `/dashboard/data`.

## 8. Scheduled jobs and webhooks

- Vercel Cron (see `vercel.json`) calls `GET /api/cron/sync` daily at 06:00 UTC, authenticated by `CRON_SECRET`. It runs due data sources and stages changes for review.
- Paystack webhook: set the URL in the Paystack dashboard to `https://lading-eazypickins.vercel.app/api/paystack/webhook`. Handles `charge.success`, `subscription.create`, `subscription.disable`, `subscription.not_renew`.
- Supabase Auth redirect URLs must include `https://lading-eazypickins.vercel.app/auth/callback` (and localhost for dev).

## 9. AI configuration

AI is restricted to free OpenRouter models. `src/lib/ai.ts` uses a primary model (from `OPENROUTER_MODEL`) with a fallback chain, and skips models that return empty or non-JSON output. Do not set `OPENROUTER_MODEL=openrouter/free`: it routes to a content-safety model that returns non-JSON.

## 10. Features shipped

- Auth: signup, login, password reset, email confirmation (SMTP required for delivery).
- Organizations, roles, profile, onboarding.
- Shipments: create, edit, auto-generated references, country dropdowns, line items, party capture (seller, buyer, notify), status workflow.
- Documents: commercial invoice, packing list, proforma, bill of lading, air waybill, certificate of origin, shipper's letter of instruction, VGM declaration, packing declaration, merged document set, company branding (logo, signature, seal).
- Requirements engine and checker, AI HS assistant.
- Consistency checks (cross-document/data validation).
- Restricted-party screening (US Consolidated Screening List, 25k+ entries, fuzzy match).
- Landed cost calculator (Nigeria), CBM calculator, trade terms (Incoterms) guidance.
- Contacts directory and products catalog with CSV import.
- Attachments (Supabase Storage), share links, agent access grants, audit trail.
- Reports and analytics, in-app notifications.
- Billing: plans, freemium limits, Paystack recurring subscriptions, self-serve cancellation.
- Admin console with user editing and manual plan management.
- Data-sync pipeline with staged human review and FX rates.
- Public API (`/api/v1`) with API keys, plus webhooks.
- Marketing site: landing, pricing, SEO resources, sitemap, robots.

## 11. Known issues and caveats

- Email confirmation is enabled; without SMTP configured, confirmation emails will not deliver and self-signup cannot complete. Configure SMTP in Supabase, or temporarily disable confirmation.
- NCS and CBN sources return HTTP 403 to datacenter IPs, so those sync sources show as degraded. The free FX API source works.
- Preview deployments share the production Supabase project (previews are behind Vercel Authentication).
- Free OpenRouter models can be inconsistent; the fallback chain mitigates this.
- Screening uses the US CSL only; UN and EU lists are not yet ingested.

## 12. Where to look

- App routes: `src/app/`
- Domain logic: `src/lib/` (shipments, requirements, consistency, landed-cost, trade-terms, screening, billing, subscriptions, api-keys, webhooks, sync, documents)
- Shared UI: `src/components/`
- Tests and checklists: `docs/test-plan.md`
- Architecture: `docs/architecture.md`
- Roadmap: `docs/ROADMAP.md`
- Branding: `docs/branding.md`

## 13. Operational checklist

- [ ] All environment variables set in Vercel (Production and Preview).
- [ ] Paystack webhook URL configured.
- [ ] Supabase redirect URLs include the auth callback.
- [ ] SMTP configured (or email confirmation disabled).
- [ ] Rotate any secrets that were shared in plain text.
- [ ] Run the smoke test in `docs/test-plan.md` after each deploy.
