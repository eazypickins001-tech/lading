# Lading - User Guide

Lading is a trade documentation and compliance platform that captures a shipment once and generates the documents, permits, checks and cost estimates you need to import or export with confidence.

This guide walks through every part of the app. It is written for traders, exporters, importers and clearing agents.

---

## Contents

1. What Lading does
2. Getting started
3. The dashboard and menus
4. Contacts (parties)
5. Products
6. Creating a shipment
7. Editing a shipment and the status workflow
8. Generating documents
9. The requirement checker and AI HS assistant
10. Consistency checks
11. Restricted party screening
12. Landed cost, CBM and trade terms
13. Attachments, sharing and access
14. Reports and notifications
15. Billing and plans
16. Settings and branding
17. The API and webhooks
18. Frequently asked questions
19. Disclaimer

---

## 1. What Lading does

You enter a shipment once. Lading then:

- Generates the document set (commercial invoice, packing list, proforma, bill of lading, air waybill, certificate of origin, shipper's letter of instruction, VGM declaration, packing declaration).
- Tells you which documents and permits apply to your corridor, from the HS code, origin, destination and direction.
- Checks your documents and shipment data for mismatches before submission.
- Screens your parties against restricted party lists.
- Estimates landed cost, duty and chargeable weight.
- Lets you share the shipment with your clearing agent and keeps an audit trail.

## 2. Getting started

1. Open the site and choose **Get started** (or **Sign in** if you already have an account).
2. Create an account with your name, organization name, email and password.
3. If email confirmation is on, check your inbox and confirm your address, then sign in.
4. On first sign in you are asked to set up your workspace: organization name, type (trader, agent, or both) and country.
5. Go to **Account -> Profile** and add your phone and country.

Forgot your password? Use the **Forgot password?** link on the sign in page. Enter your email and follow the reset link.

## 3. The dashboard and menus

The dashboard shows your plan, usage, and cards for key actions. The top menu is grouped:

| Menu | What is inside |
|---|---|
| Dashboard | Your home screen |
| Shipments | All your shipments |
| Trade tools | Requirements, Screening, Landed cost, Trade terms |
| Directory | Contacts, Products |
| Insights | Reports, Audit trail |
| Account | Profile, Billing, API, Settings, Blog |

Use the **New shipment** button in the header to start a shipment from anywhere.

## 4. Contacts (parties)

Contacts are the companies and people on your shipments: exporters, consignees (buyers), notify parties, agents, banks and carriers.

- Go to **Directory -> Contacts**.
- Add a contact with type, name, address, country and contact details (name, email, phone, tax ID).
- Edit or delete any contact.
- Import many at once with the CSV import: columns `type,name,address,country,contact_name,contact_email,contact_phone,tax_id`.

Contacts are reused across shipments, so you never retype them.

## 5. Products

Products are the goods you ship, with their HS codes.

- Go to **Directory -> Products**.
- Add a product with a description and HS code.
- Import in bulk with the CSV import: columns `description,hs_code`.

## 6. Creating a shipment

1. Click **New shipment**.
2. Fill the shipment details:
   - **Reference**: leave blank and Lading generates one (for example IMP-2026-0001), or type your own.
   - **Channel**: import or export.
   - **Origin** and **Destination**: searchable country dropdowns.
   - **Mode**: sea, air, road, rail, courier or multimodal.
   - **Currency** and **Incoterm** (with the named place).
3. Add parties:
   - **Seller / Exporter**, **Buyer / Consignee**, and optionally a **Notify party**.
   - For each, select an existing contact or choose **New** and fill the details inline.
4. Add line items: description, HS code, quantity, unit, unit value, net and gross weight. Click **Suggest** next to the HS code to get AI suggestions from the description.
5. Click to save. You are taken to the shipment page.

## 7. Editing a shipment and the status workflow

- On a shipment page, click **Edit shipment** to change any field or line item and save.
- Change the **status** with the status control. Allowed transitions follow a workflow: draft, documents pending, ready, submitted, cleared, closed, cancelled. Only valid next steps are offered.

## 8. Generating documents

From a shipment page, open any of these and download or print the PDF:

- Commercial Invoice
- Packing List
- Proforma Invoice
- Bill of Lading
- Air Waybill
- Certificate of Origin
- Shipper's Letter of Instruction
- VGM Declaration
- Packing Declaration

Use **Download document set** to merge the standard set into a single PDF.

If you upload a logo, signature or seal in **Account -> Settings**, they are placed on your documents automatically.

## 9. The requirement checker and AI HS assistant

Go to **Trade tools -> Requirements**.

- Enter an HS code, origin, destination, channel and any product attributes (plant products, food products, food/drugs/cosmetics, regulated products, preferential treatment).
- Lading returns the documents and permits that apply, split into **Required** and **May apply (verify)**, each with the issuing authority and a source link.

Examples:
- Import into Nigeria: Form M and PAAR required; SONCAP and NAFDAC conditional.
- Export from Nigeria: NEPC required; certificate of origin and phytosanitary conditional.
- Export Nigeria to the US (agri): FDA Prior Notice, NEPC and phytosanitary required.

The **AI HS assistant** suggests candidate HS codes from a plain product description. Each suggestion has a **confidence** label:
- **High**: the model is confident in that heading.
- **Medium**: plausible, depends on details it could not see.
- **Low**: a broader or adjacent heading to verify.

Suggestions are a ranked shortlist, not a ruling. Always confirm the final code with customs or a licensed broker.

## 10. Consistency checks

On a shipment page, open the **Consistency checks** card and click **Run checks**. Lading flags issues such as missing HS codes, non-positive quantities or values, missing weights, currency mismatches, duplicate lines, missing parties, missing Incoterm, and an Incoterm that does not match the transport mode. You can mark findings resolved.

Run this before you submit anything. It is the cheapest way to avoid a hold.

## 11. Restricted party screening

Go to **Trade tools -> Screening** to screen any name, or use the **Screening** card on a shipment to screen the exporter, consignee and notify party. Matches are shown with the source list and a score. Screen before you ship.

## 12. Landed cost, CBM and trade terms

- **Landed cost**: enter the HS code, FOB value, freight and insurance. Lading calculates CIF, customs duty, CISS, ETLS, surcharge, VAT and the total, in the shipment currency and in Naira. Choose a currency to prefill the exchange rate from the latest FX data.
- **CBM / chargeable weight**: enter carton dimensions and quantity to get the CBM, volumetric weight and chargeable weight for sea, air or courier.
- **Trade terms**: compare all 11 Incoterms 2020 rules, see who bears cost and risk, get a recommendation for your mode and risk appetite, and a clause snippet. Sea-only terms are flagged for non-sea modes.

## 13. Attachments, sharing and access

On a shipment page:

- **Attachments**: upload files (PDF, images, office documents, CSV), download them, or delete them.
- **Share**: create a time-limited link to share the shipment and its document set with someone outside Lading. Revoke it any time.
- **Access**: grant another organization access to the shipment (for example your clearing agent) by organization ID, and revoke it later.
- **Audit trail** (under Insights): see who did what, and when, across your organization.

## 14. Reports and notifications

- **Insights -> Reports**: totals for shipments, documents and value, plus counts by status, channel and mode, and a month by month table.
- The **bell** in the header shows notifications for shipment creation, status changes and document generation. Mark them all read when done.

## 15. Billing and plans

Go to **Account -> Billing** to see your plan, usage and the plan grid. Paid plans renew monthly through Paystack. You can cancel at any time; access continues to the end of the current period, and no further charges apply.

Plan limits apply to documents per month, shipments per month and users. When you reach a limit you are prompted to upgrade.

## 16. Settings and branding

Go to **Account -> Settings** to upload your company **logo**, **signature** and **seal**. These are placed on generated documents so they look like your own.

## 17. The API and webhooks

Go to **Account -> API** to create API keys and webhook endpoints, and to read the reference. Use an API key as a Bearer token to call the public API (list and create shipments, get a shipment, check requirements). Add a webhook endpoint to receive events such as `shipment.created` and `status.changed`, signed with an `X-Lading-Signature` header.

## 18. Frequently asked questions

**Do I need a clearing agent?**
Lading does not replace your agent. It makes the data you hand over clean, so your agent clears faster and rejects less.

**Are the HS codes official?**
No. They are suggestions. Final classification is decided by customs or a licensed broker.

**Where do the requirement rules come from?**
From published customs and agency requirements, tracked as data sources and reviewed before publication. They cover imports into Nigeria, exports from Nigeria, and agri exports from Nigeria to the US. Other corridors show an empty state until rules are added.

**Can I use Lading for both import and export?**
Yes. The same shipment record produces the right document set and requirements for either direction.

**Is my data private?**
Yes. Each organization only sees its own data. Access is enforced at the database level, and sharing is explicit and revocable.

**What happens if a video will not play on the blog?**
That is a YouTube setting on the video (embedding disabled by the owner), not an app issue.

## 19. Disclaimer

Lading provides trade documentation tools and information for general guidance only. It is not legal, customs, tax, or financial advice, and it is not a substitute for a licensed customs broker or the relevant authority. Classifications, duty rates, document requirements, and regulatory data may change and may not be complete or current. Always verify with the relevant customs authority or a licensed broker before shipping.

See the full **Terms of Service** and **Privacy Policy** in the site footer.
