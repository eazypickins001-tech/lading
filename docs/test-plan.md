# Lading - Test Plan

Manual test plan for the Lading trade documentation platform. Work through each section top to bottom. Record Pass or Fail and any notes.

## Environments

- Production: https://lading-eazypickins.vercel.app (also https://lading-three.vercel.app)
- Local: http://localhost:3000 (`pnpm dev`)
- Supabase project: mcervdzebmfzdbrbnesm
- Paystack: use test keys while validating billing.

## Test accounts

| Role | Email | Notes |
|---|---|---|
| Platform admin | geraldnoria@gmail.com | In ADMIN_EMAILS. Sees the Admin card and /admin |
| Trader A | create during testing | e.g. trader.a+<date>@gmail.com |
| Trader B | create during testing | Second tenant, used for isolation tests |
| Agent | create during testing | Organization type "agent" |

> Tip: create two separate browser profiles (or one normal + one incognito window) so you can be logged in as Trader A and Trader B at the same time.

---

## 1. Authentication

| # | Step | Expected |
|---|---|---|
| 1.1 | Sign up with a new email and organization name | Account created, redirected to the dashboard |
| 1.2 | Sign out, sign back in | Redirected to the dashboard |
| 1.3 | Visit `/dashboard` while signed out | Redirected to `/login` |
| 1.4 | Visit `/login` while signed in | Redirected to `/dashboard` |
| 1.5 | Submit login with a wrong password | Inline error, no crash |
| 1.6 | Click "Forgot password?", submit your email | Neutral "if an account exists" message (does not reveal whether the email is registered) |
| 1.7 | Open the reset email link | Lands on `/reset-password` with a valid session |
| 1.8 | Set a new password (min 8, matching) | Redirected to the dashboard, new password works, old one does not |
| 1.9 | Open an expired or tampered reset link | Message that the link is invalid, link back to `/forgot-password` |
| 1.10 | Visit `/reset-password` while signed out | Prompt to request a new link (no form shown) |

## 2. Onboarding and profile

| # | Step | Expected |
|---|---|---|
| 2.1 | New user with no organization lands on `/dashboard` | Redirected to `/onboarding` |
| 2.2 | Create an organization (name, type, country) | Organization created, redirected to `/dashboard`, owner role |
| 2.3 | Go to `/dashboard/profile` and edit name, phone, country | Saved, success message |
| 2.4 | Reload the profile page | Values persist |

## 3. Shipments

| # | Step | Expected |
|---|---|---|
| 3.1 | `/dashboard/shipments` with no data | Empty state with a call to action |
| 3.2 | Create a shipment leaving Reference blank | Reference auto-generated (IMP-YYYY-NNNN or EXP-YYYY-NNNN) |
| 3.3 | Create a second import shipment with a blank reference | Reference increments (0002) |
| 3.4 | Create a shipment with a custom reference | Custom reference is used |
| 3.5 | Origin and destination country fields | Searchable dropdown; typing filters; selecting submits the ISO code |
| 3.6 | Add and remove line items | Rows add and remove correctly |
| 3.7 | Click "Suggest" on a line item with a description | Up to 3 candidate HS codes appear; clicking one fills the HS code |
| 3.8 | Submit with no origin or destination | Inline validation error |
| 3.9 | Submit with no items | Inline validation error |
| 3.10 | Open a shipment detail page | Loads (not 404), shows facts, items, totals, documents, required documents, consistency card |
| 3.11 | Click "Edit shipment", change a value, save | Changes persist, redirected back to the detail page |
| 3.12 | Edit a shipment and leave the reference blank | Existing reference is kept |

## 4. Document generation

| # | Step | Expected |
|---|---|---|
| 4.1 | From a shipment, open Commercial Invoice | A PDF opens in a new tab with the correct parties, items, totals, Incoterm |
| 4.2 | Open Packing List | PDF with quantities and weights, no prices |
| 4.3 | Open Proforma Invoice | PDF titled "Proforma Invoice" |
| 4.4 | Generate documents beyond the plan limit | Blocked with a limit message (402 / billing prompt) |
| 4.5 | Confirm the shipment's document history reflects generated documents | Entries recorded |

## 5. Requirements checker and AI

| # | Step | Expected |
|---|---|---|
| 5.1 | `/dashboard/requirements`, import into NG, HS 8471.30 | Form M and PAAR required; SONCAP and NAFDAC conditional |
| 5.2 | Export from NG, HS 1801.00, tick "Plant products" | NEPC and Phytosanitary required |
| 5.3 | Export from NG, HS 8471.30 | No requirements (or only catch-all) |
| 5.4 | Use the AI HS assistant with "Men's cotton t-shirts, knitted" | Suggests 610910 with high confidence plus alternatives |
| 5.5 | AI assistant with an empty description | Friendly validation message, no crash |
| 5.6 | Confirm AI output is treated as a suggestion only | Disclaimer shown |

## 6. Consistency checks

| # | Step | Expected |
|---|---|---|
| 6.1 | Open a shipment, run consistency checks | Findings listed with severities |
| 6.2 | A shipment missing exporter/consignee/Incoterm | Warning findings for each |
| 6.3 | An item with no HS code | Warning finding |
| 6.4 | Incoterm FOB with mode air | Error finding (Incoterm/mode mismatch) |
| 6.5 | Mark a finding resolved | Row reflects resolved state |
| 6.6 | Re-run checks | Findings replaced, summary counts update |

## 7. Landed cost and trade terms

| # | Step | Expected |
|---|---|---|
| 7.1 | `/dashboard/landed-cost`, HS 610910, FOB 1,000,000, freight 100,000, insurance 10,000 | Breakdown: CIF 1,110,000; duty 222,000; CISS 40,000; ETLS 5,550; surcharge 15,540; VAT 104,481.75; total 1,497,571.75 |
| 7.2 | Latest NCS/FX rate hint | Shown as the default exchange rate when available |
| 7.3 | `/dashboard/trade-terms` | Table of 11 terms with obligations |
| 7.4 | Recommender with mode air | Sea-only terms (FAS/FOB/CFR/CIF) excluded |
| 7.5 | Recommender with mode sea | Sea terms included |

## 8. Billing (Paystack test mode)

| # | Step | Expected |
|---|---|---|
| 8.1 | `/dashboard/billing` | Current plan, usage bars, plan grid, renewal note |
| 8.2 | Choose a paid plan | Redirected to Paystack checkout with the correct amount in NGN |
| 8.3 | Complete a test payment | Redirected back to billing with a success banner; plan updated; "Renews on" date shown |
| 8.4 | Cancel the subscription | Access continues until the period end; status shows cancelled |
| 8.5 | Attempt to cancel again | Friendly "no active subscription" message |
| 8.6 | Confirm the Paystack webhook is configured | https://lading-eazypickins.vercel.app/api/paystack/webhook |

## 9. Admin panel (log in as the platform admin)

| # | Step | Expected |
|---|---|---|
| 9.1 | Dashboard shows an "Admin" card | Links to `/admin` |
| 9.2 | Non-admin visits `/admin` | Redirected to `/dashboard` |
| 9.3 | `/admin` | Counts for users, organizations, shipments, documents, active subscriptions, plus recent lists |
| 9.4 | `/admin/users` | All users with email, name, country, organizations, roles, created, last sign-in |
| 9.5 | `/admin/organizations` | All orgs with type, plan, member and shipment counts |
| 9.6 | `/admin/subscriptions` | All subscriptions with org, plan, status, provider, period end |
| 9.7 | `/admin/users`, click Edit on a user | Detail page with profile, password, and plan tools |
| 9.8 | Edit a user profile and save | Saved |
| 9.9 | Set a new password for a user | User can log in with the new password |
| 9.10 | Generate a reset link | A copyable link is shown |
| 9.11 | Change an org plan to a paid plan | Plan updates; the org sees the new limits |
| 9.12 | Change an org plan to free | Plan updates; any active subscription is cancelled |

## 10. Data sync console

| # | Step | Expected |
|---|---|---|
| 10.1 | `/dashboard/data` as admin | Sources table with status, cadence, last checked, hash |
| 10.2 | Run the FX API source | Status changes; a pending staged change appears with parsed rates |
| 10.3 | Approve the FX change | Rates written; landed cost hint updates |
| 10.4 | Reject a change | Marked rejected, not applied |
| 10.5 | Run all due | Runs due sources, reports results |
| 10.6 | Confirm NCS source | Shows degraded (NCS blocks datacenter IPs) - expected |

---

## 11. Security tests

These verify the audit findings. Run each after the corresponding fix is applied.

| # | Test | Steps | Expected |
|---|---|---|---|
| S1 | Tenant isolation (basic) | As Trader B, request Trader A's shipment id at `/dashboard/shipments/<A-id>` and `/api/shipments/<A-id>/documents/commercial-invoice` | 404 (not found), no data returned |
| S2 | **Cross-tenant access grant (Critical)** | As Trader B, insert a row into `shipment_access` for Trader A's shipment id and Trader B's org id (via the REST API with Trader B's token), then read Trader A's shipment | Insert must be rejected; read must remain empty |
| S3 | Cross-tenant write | As Trader B, PATCH Trader A's shipment | No rows affected; data unchanged |
| S4 | **Subscription replay (High)** | As a paying user, visit the Paystack callback URL with the same `reference` three times | Subscription period must not extend on repeat visits |
| S5 | **Open redirect (Medium)** | Visit `/auth/callback?next=https://example.com` (with a valid code) | Redirect stays on the Lading domain, never to an external site |
| S6 | Plan tampering | Call the callback with `?plan=organization` while the verified metadata plan is `starter` | The verified metadata plan is used; no upgrade |
| S7 | Service role exposure | Search the built client bundle for the service key or `SUPABASE_SERVICE_ROLE_KEY` | Not present |
| S8 | Admin gating | As a normal user, call an admin server action (e.g. changeOrgPlan) | Rejected as unauthorized |
| S9 | Cron protection | GET `/api/cron/sync` without the Authorization header | 401 |
| S10 | Webhook signature | POST to `/api/paystack/webhook` with a bad signature | 401 |
| S11 | Filename header safety | Create a shipment with a reference containing a double quote, generate a document | No header error, response is a valid PDF |

---

## 12. Regression checklist (run before each release)

- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] No em dashes anywhere (search the src tree for the U+2014 character)
- [ ] No secrets committed (`git grep -E "sk_live_|sk_test_|sb_secret_|github_pat_|vcp_"`)
- [ ] Auth, shipments, documents, requirements, consistency, landed cost, trade terms, billing, admin all load
- [ ] Vercel deployment is Ready and env vars present for Production and Preview
- [ ] Paystack webhook URL set
- [ ] Supabase redirect URLs include `/auth/callback`


Test accounts ready. Start here.
Login
URL: https://lading-eazypickins.vercel.app (or lading-three.vercel.app)
Role
Admin (you)
Trader A
Trader B
Agent
All are pre-confirmed, so they work despite email confirmation being on.
Quick test path (Trader A already has a seeded shipment)
1. Log in as Trader A → open the seeded shipment:
https://lading-eazypickins.vercel.app/dashboard/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c
(import CN→NG, CIF Apapa, 2 line items: t-shirts + laptops)
2. On that page check: Documents required (should show Form M + PAAR required, SONCAP/NAFDAC conditional), Consistency checks (run them - expect warnings for missing exporter/consignee), and download the Commercial Invoice / Packing List / Proforma.
3. Edit shipment (the page that used to 404) - change something and save.
4. Go to Requirements, Landed cost (HS 610910), Trade terms, Profile, Billing.
5. As Admin → the Admin card → /admin (users, orgs, subscriptions), then /dashboard/data and run the FX sync.
Most important test - tenant isolation (C1 fix)
1. Log in as Trader B.
2. Try to open Trader A's shipment: .../dashboard/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c
3. Expected: 404 / not found. Also try the document URL .../api/shipments/154e31ad-.../documents/commercial-invoice - expect 404.
One caveat
Do not use "Sign up" with a brand-new email - email confirmation is on and there's no SMTP, so the confirmation email won't arrive and you can't log in. The full test plan is in docs/test-plan.md.
Want me to temporarily disable email confirmation so you can also test the real signup flow, or leave it and set up SMTP?
