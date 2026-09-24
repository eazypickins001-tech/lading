# Lading

**Every document, right the first time.**

Lading is a trade documentation and compliance platform for importers, exporters, and clearing agents. It captures a shipment once and generates compliant import/export documents, flags required permits, checks documents for consistency before submission, advises on Incoterms, and estimates landed cost.

Primary market: Nigeria (import and export), expanding to Rwanda, East Africa, and AfCFTA corridors.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS v4 - deployed on **Vercel**
- **Supabase** - Postgres, Auth, Storage, Edge Functions, `pg_cron`
- **Paystack** (NGN) + Flutterwave + Stripe - billing
- **OpenRouter** - AI document extraction and validation

## Repository layout

```
src/app/                 Next.js App Router (marketing + product)
supabase/
  migrations/            Database schema (versioned SQL)
  seed.sql               Reference data: Incoterms, data sources, rules
docs/
  branding.md            Brand guidelines, logo prompts, palette
  architecture.md        System design and data-sync architecture
```

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables and fill them in:

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   pnpm dev
   ```

   Open http://localhost:3000

## Database

The schema lives in `supabase/migrations/`. Apply it with the Supabase CLI once a project is linked:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Seed reference data (Incoterms, data sources, requirement rules):

```bash
supabase db reset --linked
```

### Schema overview

- **Tenancy:** `profiles`, `organizations`, `memberships` (role-based: owner, admin, trader, agent, viewer)
- **Trade data:** `parties`, `products`, `shipments`, `shipment_items`, `shipment_documents`, `shipment_access`
- **Reference:** `hs_codes`, `tariffs`, `incoterms`, `requirement_rules`, `document_templates`
- **Quality:** `consistency_findings`
- **Billing:** `subscriptions`, `usage_counters`
- **Data sync:** `data_sources`, `source_snapshots`, `staged_changes`

Row Level Security is enabled on all tables. Organization data is isolated by membership; reference data is read-only to authenticated users and written only by the service role.

## Data sourcing

Lading tracks regulatory data from official single sources of truth (NCS CET, NTIP, WTO TTD, US Consolidated Screening List, NCS/CBN FX, NAFDAC, SON, NEPC, NACCIMA). Changes are detected by content hash, staged for human review, and only promoted to live tables after approval - never auto-published.

See `docs/architecture.md` for the full design.

## Roadmap (build order)

- **M0** - Schema, auth, organizations/roles
- **M1** - Shipment record → document generation
- **M2** - Billing and freemium gates
- **M3** - Landed cost / duty calculator
- **M4** - Requirement engine (Nigeria)
- **M5** - Cross-document consistency validator
- **M6** - Incoterms decision-support
- **M7** - Marketing/SEO site and notifications

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm lint     # eslint
```
