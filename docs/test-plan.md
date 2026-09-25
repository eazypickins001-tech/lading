# Lading - Test Plan

Manual test plan for the Lading trade documentation platform, written against the seeded sample data and test accounts. Work top to bottom. Record Pass or Fail and any notes.

## 0. Quick smoke test (about 10 minutes)

Run this first after any deploy. If all eleven pass, the core platform is healthy.

Login: `geraldnoria+tradera@gmail.com` / `Lading!Test2026`
Base URL: `https://lading-eazypickins.vercel.app`

| # | Action | Expected | Pass/Fail |
|---|---|---|---|
| 1 | Open the landing page and `/pricing` | Both load, pricing shows NGN amounts | |
| 2 | Log in as Trader A | Redirected to `/dashboard`, org "Trader A Ltd" | |
| 3 | Open `/dashboard/shipments` | Two shipments listed (IMP-2026-0001, EXP-2026-0001) | |
| 4 | Open the import shipment (`154e31ad-6fa7-4e72-9948-9a8d4e99680c`) | Loads; total NGN 23,000,000 | |
| 5 | On that shipment, open the Commercial Invoice | PDF opens with seller/buyer and totals | |
| 6 | Open `/dashboard/requirements`, import into NG, HS 8471.30 | Form M and PAAR required | |
| 7 | Export NG to US, HS 1801.00 | FDA Prior Notice, NEPC and Phytosanitary required | |
| 8 | On the import shipment, run consistency checks | Findings render | |
| 9 | Log in as admin (`geraldnoria@gmail.com` / `Ldg!Admin#2026-52772104`), open `/admin` | Admin overview loads | |
| 10 | Log in as Trader B (`geraldnoria+traderb@gmail.com`), open Trader A's import shipment URL | 404, no data (tenant isolation) | |
| 11 | Open `/blog`, open a post, play the video | List and post load; the embedded video plays | |

If check 10 fails, stop and treat it as a security incident (see section 20).

## 1. Environments and access

| Item | Value |
|---|---|
| Production URL | https://lading-eazypickins.vercel.app (alias https://lading-three.vercel.app) |
| Local | http://localhost:3000 (`pnpm dev`) |
| Supabase project | mcervdzebmfzdbrbnesm |
| Repo | https://github.com/eazypickins001-tech/lading |

Tips:
- Use two browser profiles so you can be logged in as two tenants at once (needed for isolation and sharing tests).
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
| Trader A | Export shipment | `EXP-2026-0001` | NG to GB | sea / FOB Apapa Port | Cocoa (HS 180100) x500 @ USD 2,400; Sesame (HS 120740) x200 @ USD 1,500 |
| Trader A | Parties | - | - | - | Exporter: GreenBuild Manufacturing (CN); Consignee: EazyPickins Distribution (NG) |
| Trader B | Import shipment | `IMP-2026-0001` | US to NG | air / FCA JFK | Laptops (HS 847130) x20 @ NGN 420,000 |
| Agent | none | - | - | - | Used for access-grant tests |

Direct links (log in as Trader A first):
- Import: `https://lading-eazypickins.vercel.app/dashboard/shipments/154e31ad-6fa7-4e72-9948-9a8d4e99680c`
- Export: `https://lading-eazypickins.vercel.app/dashboard/shipments/f0b650f5-6f71-4667-ab25-3747a3bb439a`

## 4. Navigation

| # | Steps | Expected |
|---|---|---|
| 4.1 | Look at the dashboard header on desktop | Six top-level items: Dashboard, Shipments, Trade tools, Directory, Insights, Account |
| 4.2 | Hover or click "Trade tools" | Dropdown with Requirements, Screening, Landed cost, Trade terms |
| 4.3 | Open a page from a dropdown | The parent stays highlighted; the dropdown closes on outside click |
| 4.4 | Resize to mobile, open the menu | Grouped sections with headings; menu scrolls if long |
| 4.5 | Keyboard: Tab to a group, press Enter, arrow to an item, press Enter | Navigates correctly |
| 4.6 | Desktop marketing header | Includes a Blog link; clicking it opens `/blog` |
| 4.7 | Resize the marketing header below 1024px and open the hamburger | Lists Platform, Import & Export, Data, Blog, Resources, Pricing |
| 4.8 | App menu, Account, then Blog | Opens `/blog` |

## 5. Authentication

| # | Steps | Expected |
|---|---|---|
| 5.1 | Log in as Trader A | Redirected to `/dashboard` |
| 5.2 | Sign out, sign back in | Works |
| 5.3 | Visit `/dashboard` while signed out | Redirected to `/login` |
| 5.4 | Visit `/login` while signed in | Redirected to `/dashboard` |
| 5.5 | Wrong password | Inline error, no crash |
| 5.6 | "Forgot password?" with a valid email | Neutral "if an account exists" message |
| 5.7 | Submit the login form 11 times quickly with a wrong password | After 10 attempts, "Too many attempts" (rate limit) |
| 5.8 | "Sign up" with a new email | "Check your email to confirm your account" (no session until confirmed) |

## 6. Onboarding and profile

| # | Steps | Expected |
|---|---|---|
| 6.1 | Create a new organization for a user with no org | `/onboarding`, then dashboard after saving |
| 6.2 | `/dashboard/profile`, edit name, phone, country, save | Saved, persists on reload |

## 7. Contacts and products

| # | Steps | Expected |
|---|---|---|
| 7.1 | `/dashboard/parties` | Lists Trader A's parties (GreenBuild, EazyPickins) |
| 7.2 | Add a new contact (type exporter, name, country, contact details) | Saved and listed |
| 7.3 | Edit and delete a contact | Works |
| 7.4 | CSV import on the contacts page: paste `type,name,country` rows | Created/updated counts shown |
| 7.5 | `/dashboard/products` | Lists products; add, edit, delete work |
| 7.6 | CSV import products: `description,hs_code` | Created/updated counts shown |

## 8. Shipments and party capture

| # | Steps | Expected |
|---|---|---|
| 8.1 | `/dashboard/shipments` as Trader A | 2 shipments listed |
| 8.2 | New shipment, leave Reference blank | Auto-generated (IMP-2026-0002) |
| 8.3 | Origin/Destination | Searchable country dropdown; submits the ISO code |
| 8.4 | Seller / Exporter section: choose "New", fill name, address, country, contacts | Accepted |
| 8.5 | Buyer / Consignee section: select an existing contact | Accepted |
| 8.6 | Notify Party section: leave blank | Accepted (optional) |
| 8.7 | Add/remove line items; click "Suggest" on a described item | HS suggestions appear; clicking one fills the HS code |
| 8.8 | Submit with no origin or no items | Inline validation error |
| 8.9 | Open the new shipment | Parties show on the detail page; totals correct |
| 8.10 | Edit the shipment, change the consignee, save | Saved; parties update |
| 8.11 | Confirm totals on the import shipment | Qty 1,050; value NGN 23,000,000; net 300 kg, gross 330 kg |
| 8.12 | Change the status via the status control | Only allowed transitions offered; change saved |
| 8.13 | Try an invalid transition (e.g. closed to draft) | Not offered / rejected |

## 9. Documents

| # | Steps | Expected |
|---|---|---|
| 9.1 | Import shipment: Commercial Invoice | PDF with seller/buyer, items, totals, CIF Apapa |
| 9.2 | Packing List | Quantities and weights, no prices |
| 9.3 | Proforma Invoice | Titled "Proforma Invoice" |
| 9.4 | Bill of Lading | Ocean BL data sheet with shipper, consignee, notify, ports |
| 9.5 | Air Waybill | AWB data sheet |
| 9.6 | Certificate of Origin | Exporter, consignee, origin, goods, HS code |
| 9.7 | Shipper's Letter of Instruction | Instructions to the forwarder |
| 9.8 | VGM Declaration | Verified gross mass declaration |
| 9.9 | Packing Declaration | Packing materials declaration |
| 9.10 | Download document set | A single merged PDF of the standard set |
| 9.11 | Upload a logo, signature and seal in Settings, then open a document | Branding appears on the PDF |
| 9.12 | Generate documents past the Free plan limit | Blocked with a plan-limit message |

## 10. Requirements checker and AI

| # | Steps | Expected |
|---|---|---|
| 10.1 | Import into NG, HS 8471.30 | Form M and PAAR required; SONCAP and NAFDAC conditional |
| 10.2 | Export NG to GB, HS 1801.00 | NEPC required; Certificate of Origin and Phytosanitary conditional |
| 10.3 | Export NG to GB, no HS code | NEPC required (catch-all now applies) |
| 10.4 | Export NG to US, HS 1801.00 (cocoa) | FDA Prior Notice, NEPC and Phytosanitary required |
| 10.5 | Export NG to US, HS 1207.40 (sesame) | FDA Prior Notice, NEPC and Phytosanitary required |
| 10.6 | Export NG to US, HS 8471.30, tick "Food products" | FDA Prior Notice required |
| 10.7 | Export NG to US, HS 8471.30, no attributes | FDA Prior Notice conditional (may apply) |
| 10.8 | Export NG to GB, HS 1801.00 | No FDA rule (US only) |
| 10.9 | Export CN to NG (not a Nigeria corridor) | Empty state with the explanatory note |
| 10.10 | AI HS assistant: "Men's cotton t-shirts, knitted" | Suggests 610910 with a confidence label plus alternatives |
| 10.11 | Confirm the confidence label meaning | High = likely, medium/low = alternatives to verify; disclaimer shown |

## 11. Consistency checks

| # | Steps | Expected |
|---|---|---|
| 11.1 | Run checks on the import shipment | Minimal or no findings (parties, Incoterm, HS, weights set) |
| 11.2 | Create a shipment with no parties/Incoterm and an item with no HS code, run checks | Warnings for each |
| 11.3 | Set Incoterm FOB with mode air, run checks | Error: Incoterm/mode mismatch |
| 11.4 | Mark a finding resolved | Row shows resolved |
| 11.5 | Re-run checks | Findings replaced, counts update |

## 12. Restricted-party screening

| # | Steps | Expected |
|---|---|---|
| 12.1 | `/dashboard/screening`, screen "LIMITED LIABILITY COMPANY AVIAKOMPANIYA POBEDA" | Returns a match from the SDN list with a high score |
| 12.2 | Screen an ordinary name (e.g. "EazyPickins Distribution Ltd") | No matches |
| 12.3 | On the import shipment, click "Screen parties" | Runs and shows results or an all-clear state |
| 12.4 | As admin, `/dashboard/data`, click "Sync screening list" | Re-ingests the CSL and reports counts |

## 13. Landed cost, CBM and trade terms

| # | Steps | Expected |
|---|---|---|
| 13.1 | `/dashboard/landed-cost`, HS 610910, FOB 1,000,000, freight 100,000, insurance 10,000 | CIF 1,110,000; duty 222,000; CISS 40,000; ETLS 5,550; surcharge 15,540; VAT 104,481.75; total 1,497,571.75 |
| 13.2 | Change the currency selector to USD | Exchange rate prefilled from the latest FX rate; totals convert |
| 13.3 | CBM card: sea, 10 cartons of 60x40x40 cm | CBM 0.96 |
| 13.4 | CBM card: air, same cartons | Volumetric weight 160.32 kg; chargeable weight uses the greater of actual and volumetric |
| 13.5 | `/dashboard/trade-terms` | 11 terms table; recommender excludes sea-only terms for air |

## 14. Attachments, sharing, access, audit

| # | Steps | Expected |
|---|---|---|
| 14.1 | Import shipment, Attachments card, upload a PDF | Uploaded and listed |
| 14.2 | Download an attachment | Signed URL opens the file |
| 14.3 | Delete an attachment | Removed from the list |
| 14.4 | Share card: create a share link with a 7-day expiry | Link shown with expiry |
| 14.5 | Open the share link in an incognito window | Shipment summary + document set download, no login required |
| 14.6 | Revoke the share link, reopen it | Friendly "link is invalid or expired" message |
| 14.7 | Access card: grant the Agent org access by org id | Grant listed |
| 14.8 | Log in as the Agent org | The shared shipment is visible |
| 14.9 | Revoke access, refresh as the Agent | No longer visible |
| 14.10 | `/dashboard/audit` | Recent events (document download, shipment create/update, status change, screening) with user and timestamp |

## 15. Reports and notifications

| # | Steps | Expected |
|---|---|---|
| 15.1 | `/dashboard/reports` | Stat cards (shipments, documents, value) and counts by status, channel, mode, and a 6-month table |
| 15.2 | Create a shipment, then open the notification bell | A "shipment created" notification appears |
| 15.3 | Change a shipment status | A notification appears |
| 15.4 | Mark all read | Unread count goes to zero |

## 16. Blog (public and admin)

Public blog:

| # | Steps | Expected |
|---|---|---|
| 16.1 | Open `/blog` | Published posts listed with cover images (or a placeholder) |
| 16.2 | Open a post | Title, date, tags, cover, video, body and CTA all render |
| 16.3 | Play the embedded YouTube video | The video plays (not blocked) |
| 16.4 | Click "Watch on TikTok / Instagram / Facebook / Threads / Bluesky" | Opens the correct platform link in a new tab |
| 16.5 | A post with no cover but with a YouTube URL | The YouTube thumbnail is used as the cover |

Admin blog (log in as the platform admin):

| # | Steps | Expected |
|---|---|---|
| 16.6 | `/admin/blog` | All posts listed with published status and dates |
| 16.7 | Non-admin visits `/admin/blog` | Redirected to `/dashboard` |
| 16.8 | New post: title, slug (blank auto-generates), description, tags, body (blank line = new paragraph), YouTube URL, platform URLs | Saved and listed |
| 16.9 | Leave Published unticked | Draft is NOT visible on `/blog` |
| 16.10 | Tick Published and save | Appears on `/blog` immediately |
| 16.11 | Upload a cover image and save | Cover shows on the card and the post page |
| 16.12 | Paste a cover URL instead of a file and save | That URL is used as the cover |
| 16.13 | Edit a post, change the title, save | Changes appear on the public post |
| 16.14 | Delete a post | Removed from admin and from `/blog` |

## 17. Billing (optional - see note)

> Prices are production amounts (Starter NGN 10,000, Professional 35,000, Organization 90,000, Agent 50,000). Only run a real payment if your Vercel Paystack key is a test key.

| # | Steps | Expected |
|---|---|---|
| 17.1 | `/dashboard/billing` | Current plan, usage bars, plan grid with NGN prices, renewal note |
| 17.2 | Choose a paid plan | Redirected to Paystack with the correct amount |
| 17.3 | Complete a test payment | Back on billing with success, plan updated, "Renews on" date |
| 17.4 | Cancel subscription | Access continues to period end; status cancelled |
| 17.5 | Revisit the callback URL with the same reference | Period must NOT extend (replay protection) |

## 18. Public API and webhooks

| # | Steps | Expected |
|---|---|---|
| 18.1 | `/dashboard/api`, create an API key | Plain key shown once; only the prefix is listed afterwards |
| 18.2 | `curl -H "Authorization: Bearer <key>" https://lading-eazypickins.vercel.app/api/v1/shipments` | JSON list of the org's shipments |
| 18.3 | `POST /api/v1/shipments` with a JSON body | Shipment created; returns id and reference |
| 18.4 | `GET /api/v1/shipments/<id>` for another org's shipment | 404 |
| 18.5 | `POST /api/v1/requirements` | Returns the required documents |
| 18.6 | Call with no or a revoked key | 401 |
| 18.7 | Add a webhook endpoint, then create a shipment | A `shipment.created` delivery is recorded with an `X-Lading-Signature` header |
| 18.8 | Revoke the API key | Subsequent calls return 401 |

## 19. Admin and data sync

| # | Steps | Expected |
|---|---|---|
| 19.1 | Dashboard shows an "Admin" card | Links to `/admin` |
| 19.2 | Non-admin visits `/admin` | Redirected to `/dashboard` |
| 19.3 | `/admin`, `/admin/users`, `/admin/organizations`, `/admin/subscriptions` | All load with data |
| 19.4 | `/admin/users`, Edit a user | Profile edit, set password, generate reset link, change plan |
| 19.5 | `/admin/blog` | Blog management loads (see section 16) |
| 19.6 | `/dashboard/data` | Sources table with status, cadence, last checked, hash |
| 19.7 | Run the FX API source, approve the change | FX rates written; landed cost hint updates |
| 19.8 | Confirm the NCS source | Degraded (NCS blocks datacenter IPs) - expected |
| 19.9 | Click "Sync platform admins" | Emails in ADMIN_EMAILS are copied into the platform_admins table |

## 20. Security tests

| # | Steps | Expected |
|---|---|---|
| S1 | As Trader B, open Trader A's shipment URL | 404, no data |
| S2 | As Trader B, open Trader A's document URL | 404 |
| S3 | As Trader B (REST with Trader B's token), POST `shipment_access` for Trader A's shipment | Rejected (403 row-level security) |
| S4 | As Trader B, PATCH Trader A's shipment | No effect |
| S5 | Open `/auth/callback?next=https://example.com` | Stays on the Lading domain |
| S6 | GET `/api/cron/sync` without the Authorization header | 401 |
| S7 | POST `/api/paystack/webhook` with a bad signature | 401 |
| S8 | As a normal user, call an admin action | Rejected as unauthorized |
| S9 | Call `/api/v1/shipments` with no key | 401 |
| S10 | Open a share link after its expiry | Rejected |
| S11 | As an anonymous visitor, GET `/rest/v1/blog_posts?published=eq.false` | Empty (drafts are admin-only) |
| S12 | Search the client bundle for the service role key | Not present |

## 21. Regression checklist (before each release)

- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] No em dashes in `src` (search for the U+2014 character)
- [ ] No secrets committed (`git grep -E "sk_live_|sk_test_|sb_secret_|github_pat_|vcp_|sbp_"`)
- [ ] All dashboard pages load
- [ ] `/blog` loads and an embedded video plays
- [ ] Vercel deployment is Ready; env vars present for Production and Preview
- [ ] Paystack webhook URL set; Supabase redirect URLs include `/auth/callback`
- [ ] Supabase email confirmation matches the SMTP situation
- [ ] Screening data present (`screening_entries` count greater than 20000)
- [ ] `platform_admins` matches `ADMIN_EMAILS` (run Sync platform admins)

## 22. Known issues and notes

- Email confirmation is ON but SMTP is not configured, so self-service signup cannot complete. Use the test accounts, or configure SMTP.
- NCS and CBN sources return HTTP 403 to datacenter IPs, so those sync sources show as degraded. The FX API source works.
- Preview deployments share the production Supabase project (previews are behind Vercel Authentication).
- Requirement rules cover imports into Nigeria, exports from Nigeria, and agri exports from Nigeria to the US. Other corridors return the empty state.
- Screening uses the US Consolidated Screening List only; UN and EU lists are not yet ingested.
- Free OpenRouter models can be inconsistent; a fallback chain mitigates this.
- Blog covers fall back to the YouTube thumbnail when no cover image is set.
- If a specific YouTube video will not embed, the video owner may have disabled embedding; that is a YouTube setting, not an app issue.
- Adding an admin to ADMIN_EMAILS also requires running "Sync platform admins" on the data console so database and storage access match.
- Blog content can be managed only by platform admins at `/admin/blog`.
