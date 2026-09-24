# Lading - Architecture

## Overview

Lading is a multi-tenant SaaS. A Next.js app on Vercel serves both the marketing site and the product. Supabase provides Postgres, authentication, storage, and scheduled jobs. Regulatory data is ingested from official sources through a review-gated sync pipeline.

```
[Next.js app on Vercel]
        │
        ├── Server Components / Server Actions ──► [Supabase Postgres (RLS)]
        │
        ├── Document service ──► PDF generation + OCR/extraction
        │
        ├── Requirement engine ──► rules + tariff data
        │
        ├── Consistency validator ──► deterministic rules + OpenRouter
        │
        ├── Incoterms + landed-cost engine
        │
        └── Billing webhooks ──► Paystack / Flutterwave / Stripe
                                            │
[Vercel Cron / Supabase pg_cron] ──► [Data-sync pipeline] ──► staged review ──► live reference tables
```

## Tenancy and roles

- A user (`auth.users` → `profiles`) belongs to one or more `organizations` via `memberships`.
- Organization types: `trader`, `agent`, `both`.
- Roles: `owner`, `admin`, `trader`, `agent`, `viewer`.
- Clearing agents gain access to a trader's shipment through `shipment_access`, so a shipment can be worked on by both the trader org and an assigned agent org.

Row Level Security enforces isolation:

- `is_org_member(org_id)` - read access.
- `has_org_role(org_id, roles[])` - write access.
- `can_access_shipment(shipment_id)` - membership **or** granted agent access.

## Domain model

A **shipment** is the unit of work. It carries a direction (`import` or `export`), origin and destination countries, transport mode, Incoterm, and status. It owns **items** (goods with HS codes, quantities, values, weights) and a set of **documents**. A **requirement rule** maps `(hs_prefix, origin, destination, channel)` to a required `doc_type` and issuing authority. **Consistency findings** record mismatches across a shipment's documents.

Because the engine keys on `channel`, import and export are symmetric: the same shipment record yields Form M / PAAR / SONCAP for imports or NEPC / NACCIMA COO / phytosanitary for exports.

## Document pipeline (M1)

1. User captures a shipment and its items once.
2. Document templates map shipment + party + item data into each document type.
3. Documents are rendered to PDF server-side and stored in Supabase Storage.
4. Generated documents and their structured `data` are stored in `shipment_documents`.

## Requirement engine (M4)

Deterministic, rule-based, and explainable:

- Input: `hs_code`, origin, destination, channel, product attributes.
- Match against `requirement_rules` by HS prefix and corridor.
- Output: required documents and permits with issuing authority, conditions, and a source URL.

Every rule carries `source_url` and `effective_from` so results are auditable.

## Consistency validator (M5)

Two layers:

1. **Deterministic** - exact cross-checks (invoice totals vs packing list, HS codes align, weights and quantities reconcile, letter-of-credit terms vs documents).
2. **AI-assisted** - extraction from uploaded PDFs and semantic checks via OpenRouter.

Findings are stored with a severity (`info`, `warning`, `error`, `critical`) and the documents involved.

## Incoterms and landed cost (M3, M6)

- Incoterms decision-support compares cost and risk transfer per term for a given mode and route, then generates clause text. Branding must not use the ICC "Incoterms" trademark.
- Landed cost combines ECOWAS CET duty, levies (CISS, ETLS, surcharge), VAT, freight, and insurance, using current customs FX rates.

## Data-sync architecture

Regulatory change is detected, staged, reviewed, and promoted - never auto-published.

### Tables

- `data_sources` - registry of sources with URL, access method, cadence, parser key, content hash, status.
- `source_snapshots` - each fetch with its content hash and diff summary.
- `staged_changes` - proposed changes awaiting review (entity, old value, new value, status).
- Live reference tables (`tariffs`, `hs_codes`, `requirement_rules`, `incoterms`, `document_templates`) update only after approval.

### Flow

1. A scheduled job (Vercel Cron or Supabase `pg_cron`) fetches a source on its cadence.
2. The payload is normalized and hashed; the hash is compared to the last snapshot.
3. If unchanged, only `last_checked_at` is updated.
4. If changed, the diff is parsed and written to `staged_changes` as `pending`.
5. An admin reviews the change in the back-office.
6. On approval, the change is promoted to live tables with provenance (`source_url`, `effective_from`, `retrieved_at`).
7. If a fetch fails or the format changes, the source is marked `degraded` and an alert is raised - stale data is never served silently.

### Cadences

| Category | Cadence |
|---|---|
| Exchange rates (NCS, CBN) | daily |
| Sanctions / screening lists | daily |
| Tariffs / CET / HS | weekly (plus WTO tariff-action notices) |
| Permits / procedures | weekly |
| HS classification | on demand |

### Principles

- Human-in-the-loop for compliance-critical changes, to protect against both government-site errors and liability.
- Every live rule carries provenance and effective dates.
- Official APIs and structured downloads are preferred; scraping is a fallback.
- Crawling respects robots.txt and terms of service, with caching and rate limiting.

## Source coverage

Free official sources only:

- **Tariffs / HS:** NCS CET portal, NTIP, WTO Tariff & Trade Data, ECOWAS CET.
- **Screening:** US Consolidated Screening List API, UN, EU, UK OFSI.
- **FX:** NCS customs rate, CBN.
- **Permits:** NAFDAC, SON/SONCAP, NEPC, NACCIMA, FMITI.

The WCO's Explanatory Notes are copyrighted and are linked, not redistributed.

## Security

- RLS on every table; reference data read-only to authenticated users.
- Service role key used only in server-side sync and admin operations.
- Secrets stored in Vercel and Supabase environment configuration.
