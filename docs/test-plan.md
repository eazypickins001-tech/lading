# Lading - Test Plan

Manual test plan for the Lading trade documentation platform, written against the seeded sample data and test accounts. Work top to bottom. Record Pass or Fail and any notes.

## 1. Environments and access

| Item | Value |
|---|---|
| Production URL | https://lading-eazypickins.vercel.app (alias: https://lading-three.vercel.app) |
| Local | http://localhost:3000 (`pnpm dev`) |
| Supabase project | mcervdzebmfzdbrbnesm |
| Repo | https://github.com/eazypickins001-tech/lading |

Tips:
- Use two browser profiles (or one normal + one incognito) so you can be logged in as two tenants at once (needed for the isolation tests).
- Do NOT use "Sign up" with a brand-new email: email confirmation is ON and SMTP is not configured, so the confirmation email will not arrive. Use the accounts below (all pre-confirmed).

## 2. Test accounts

| Role | Email | Password |
|---|---|---|
| Platform admin | `geraldnoria@gmail.com` | `Ldg!Admin#2026-52772104` |
| Trader A (owner) | `geraldnoria+tradera@gmail.com` | `Lading!Test2026` |
| Trader B (owner) | `geraldnoria+traderb@gmail.com` | `Lading!Test2026` |
| Agent (owner) | `geraldnoria+agent@gmail.com` | `Lading!Test2026` |

Change the admin password after testing.

## 3. Seeded sample data

| Tenant | What | Reference | Route | Mode / Incoterm | Items |
|---|---|---|---|---|---|
| Trader A | Import shipment | `IMP-2026-0001` | CN to NG | sea / CIF Apapa | T-shirts (HS 610910) x1000 @ NGN 500; Laptops (HS 847130) x50 @ NGN 450,000 |
| Trader A | Export shipment | `EXP-2026-0001` | NG to GB | sea / FOB Apapa Port | Cocoa beans (HS 180100) x500 @ USD 2,400; Sesame (HS 120740) x200 @ USD 1,500 |
| Trader A | Parties | - | - | - | Exporter: GreenBuild Manufacturing Co Ltd (CN); Consignee: EazyPickins Distribution Ltd (NG) - linked to the import shipment |
| Trader B | Import shipment | `IMP-2026-0001` | US to NG | air / FCA JFK Airport | Laptops (HS 847130) x20 @ NGN 420,000 |
| Agent | none | - | - | - | Used for access-grant tests |

Direct links (log in as Trader A first):
- Import: `https://lading-eazypickins.vercel.app/dashboard/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c`
- Export: `https://lading-eazypickins.vercel.app/dashboard/shipments/f0b650f5-6f71-4667-ab25-3747a3bb439a`

## 4. Authentication

| # | Steps | Expected |
|---|---|---|
| 4.1 | Log in as Trader A | Redirected to `/dashboard`, organization "Trader A Ltd" shown |
| 4.2 | Sign out, sign back in | Works |
| 4.3 | Visit `/dashboard` while signed out | Redirected to `/login` |
| 4.4 | Visit `/login` while signed in | Redirected to `/dashboard` |
| 4.5 | Wrong password | Inline error, no crash |
| 4.6 | "Forgot password?" with a valid email | Neutral "if an account exists" message |
| 4.7 | Submit the login form 11 times quickly with a wrong password | After 10 attempts, "Too many attempts" (rate limit) |
| 4.8 | "Sign up" with a new email | "Check your email to confirm your account" (no session until confirmed) |

## 5. Onboarding and profile

| # | Steps | Expected |
|---|---|---|
| 5.1 | Create a brand-new organization for a user with no org | Redirected to `/onboarding`, then to the dashboard after saving |
| 5.2 | `/dashboard/profile`, edit name, phone, country, save | Saved, success message, values persist on reload |

## 6. Shipments

| # | Steps | Expected |
|---|---|---|
| 6.1 | `/dashboard/shipments` as Trader A | 2 shipments listed (IMP-2026-0001, EXP-2026-0001) |
| 6.2 | Create a shipment leaving Reference blank | Reference auto-generated, e.g. IMP-2026-0002 |
| 6.3 | Origin and Destination fields | Searchable country dropdown; typing "Nig" filters to Nigeria; selecting submits the ISO code |
| 6.4 | Add and remove line items | Rows add and remove |
| 6.5 | Click "Suggest" on a line item (e.g. "Men's cotton t-shirts, knitted") | Up to 3 HS suggestions; clicking one fills the HS code (expect 610910) |
| 6.6 | Submit with no origin or no items | Inline validation error |
| 6.7 | Open Trader A's import shipment (link above) | Loads with facts, items, totals, documents, required documents, consistency card |
| 6.8 | Confirm totals on the import shipment | Total quantity 1,050; total value NGN 23,000,000; net weight 300 kg, gross 330 kg |
| 6.9 | Click "Edit shipment", change the Incoterm place, save | Saved, redirected to the detail page |
| 6.10 | Edit a shipment and clear the Reference, save | Existing reference is kept |
| 6.11 | Open Trader A's export shipment | Loads; total value USD 1,500,000 |

## 7. Document generation

| # | Steps | Expected |
|---|---|---|
| 7.1 | Import shipment, open Commercial Invoice | PDF opens: seller GreenBuild (CN), buyer EazyPickins (NG), 2 line items, total NGN 23,000,000, CIF Apapa |
| 7.2 | Open Packing List | Quantities and weights, no prices |
| 7.3 | Open Proforma Invoice | Titled "Proforma Invoice", marked not a final invoice |
| 7.4 | Export shipment, open Commercial Invoice | Amounts in USD, total USD 1,500,000, FOB Apapa Port |
| 7.5 | Generate documents past the Free plan limit (10/month) | Blocked with a plan-limit message |
| 7.6 | Confirm each generation is recorded | Shipment document history / Admin audit events show it |

## 8. Requirements checker and AI

| # | Steps | Expected |
|---|---|---|
| 8.1 | `/dashboard/requirements`, import into NG, HS 8471.30 | Form M and PAAR required; SONCAP and NAFDAC conditional |
| 8.2 | Export from NG, HS 1801.00, tick "Plant products" | NEPC and Phytosanitary required |
| 8.3 | Export from NG, HS 8471.30 | No requirements (catch-all only) |
| 8.4 | AI HS assistant: "Men's cotton t-shirts, knitted" | Suggests 610910 (high confidence) plus alternatives |
| 8.5 | AI assistant with an empty description | Friendly validation message, no crash |

## 9. Consistency checks

| # | Steps | Expected |
|---|---|---|
| 9.1 | Open Trader A's import shipment, run consistency checks | Findings list with severities (should be minimal or none since parties/Incoterm/HS/weights are set) |
| 9.2 | Create a shipment with no exporter/consignee/Incoterm and an item with no HS code, run checks | Warnings for missing exporter, consignee, Incoterm, HS code |
| 9.3 | Set Incoterm FOB with mode air, run checks | Error: Incoterm/mode mismatch |
| 9.4 | Mark a finding resolved | Row shows resolved |
| 9.5 | Re-run checks | Findings replaced, counts update |

## 10. Landed cost and trade terms

| # | Steps | Expected |
|---|---|---|
| 10.1 | `/dashboard/landed-cost`, HS 610910, FOB 1,000,000, freight 100,000, insurance 10,000 | CIF 1,110,000; duty 222,000; CISS 40,000; ETLS 5,550; surcharge 15,540; VAT 104,481.75; total 1,497,571.75 |
| 10.2 | Latest FX hint | Shown as the default exchange rate when available |
| 10.3 | `/dashboard/trade-terms` | Table of 11 terms |
| 10.4 | Recommender with mode air | Sea-only terms (FAS, FOB, CFR, CIF) excluded |
| 10.5 | Recommender with mode sea | Sea terms included |

## 11. Billing (optional - see note)

> Prices are production amounts (Starter NGN 10,000, Professional 35,000, Organization 90,000, Agent 50,000). Only run a real payment if your Vercel `PAYSTACK_SECRET_KEY` is a test key. Otherwise skip to 11.5.

| # | Steps | Expected |
|---|---|---|
| 11.1 | `/dashboard/billing` | Current plan, usage bars, plan grid with correct NGN prices, renewal note |
| 11.2 | Choose a paid plan | Redirected to Paystack with the correct amount |
| 11.3 | Complete a test payment | Back on billing with a success banner, plan updated, "Renews on" date |
| 11.4 | Cancel subscription | Access continues to period end; status cancelled |
| 11.5 | Confirm the Paystack webhook | https://lading-eazypickins.vercel.app/api/paystack/webhook |
| 11.6 | Confirm the callback cannot be replayed | Revisit the callback URL with the same reference; the period must NOT extend |

## 12. Admin panel (log in as the platform admin)

| # | Steps | Expected |
|---|---|---|
| 12.1 | Dashboard shows an "Admin" card | Links to `/admin` |
| 12.2 | Log in as Trader A, visit `/admin` | Redirected to `/dashboard` |
| 12.3 | `/admin` | Counts for users, organizations, shipments, documents, active subscriptions, plus recent lists |
| 12.4 | `/admin/users` | All users with email, name, country, organizations, roles, created, last sign-in |
| 12.5 | `/admin/organizations` | All orgs with type, plan, member and shipment counts |
| 12.6 | `/admin/subscriptions` | All subscriptions with org, plan, status, provider, period end |
| 12.7 | `/admin/users`, click Edit on Trader A | Detail page with profile, password, and plan tools |
| 12.8 | Edit a user profile and save | Saved |
| 12.9 | Set a new password for a user | That user can log in with it |
| 12.10 | Generate a reset link | A copyable link is shown |
| 12.11 | Change an org plan to Professional | Plan updates; the org sees the new limits |
| 12.12 | Change an org plan to Free | Plan updates; any active subscription is cancelled |

## 13. Data sync console

| # | Steps | Expected |
|---|---|---|
| 13.1 | `/dashboard/data` as admin | Sources table with status, cadence, last checked, hash |
| 13.2 | Run the FX API source ("Exchange Rate API (NGN)") | Status changes; a pending staged change appears with parsed rates |
| 13.3 | Approve the FX change | Rates written; the landed cost hint updates |
| 13.4 | Reject a change | Marked rejected, not applied |
| 13.5 | Confirm the NCS source | Shows degraded (NCS blocks datacenter IPs) - expected |

## 14. Security tests

Run these after the security fixes (already applied). The isolation tests are the most important.

| # | Steps | Expected |
|---|---|---|
| S1 | As Trader B, open Trader A's import shipment link (`/dashboard/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c`) | 404, no data |
| S2 | As Trader B, open `.../api/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c/documents/commercial-invoice` | 404 |
| S3 | **Cross-tenant access grant.** As Trader B (via REST with Trader B's token), POST to `/rest/v1/shipment_access` with `shipment_id` = Trader A's shipment and `org_id` = Trader B's org | Rejected with a row-level security error (403) |
| S4 | As Trader B, PATCH Trader A's shipment | No effect; data unchanged |
| S5 | Open `/auth/callback?next=https://example.com` | Stays on the Lading domain (no external redirect) |
| S6 | GET `/api/cron/sync` without the Authorization header | 401 |
| S7 | POST `/api/paystack/webhook` with a bad signature | 401 |
| S8 | As a normal user, call an admin action (change org plan) | Rejected as unauthorized |
| S9 | Search the built client bundle for `SUPABASE_SERVICE_ROLE_KEY` / the service key | Not present |
| S10 | Create a shipment with a reference containing a double quote, generate a document | No header error, valid PDF returned |
| S11 | Log in as Agent, then as Trader A grant the Agent org access to a shipment (insert shipment_access as the owner) | Trader A can insert (201); the Agent can then read that shipment |

## 15. Regression checklist (before each release)

- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] No em dashes in `src` (search for the U+2014 character)
- [ ] No secrets committed (`git grep -E "sk_live_|sk_test_|sb_secret_|github_pat_|vcp_|sbp_"`)
- [ ] Auth, shipments, documents, requirements, consistency, landed cost, trade terms, billing, admin all load
- [ ] Vercel deployment is Ready; env vars present for Production and Preview
- [ ] Paystack webhook URL set; Supabase redirect URLs include `/auth/callback`
- [ ] Supabase email confirmation matches the SMTP situation

## 16. Known issues and notes

- Email confirmation is ON but SMTP is not configured, so self-service signup cannot complete. Use the test accounts, or configure SMTP.
- NCS/CBN sources return HTTP 403 to datacenter IPs, so those sync sources show as degraded. The FX API source works.
- Preview deployments share the production Supabase project (accepted, previews are behind Vercel Authentication).
- Prices are the production amounts.
