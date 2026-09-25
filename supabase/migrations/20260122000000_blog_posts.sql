create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  body jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  youtube_url text,
  videos jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

create policy blog_posts_select_published on public.blog_posts
  for select using (published = true);

create policy blog_posts_select_admin on public.blog_posts
  for select using (public.is_platform_admin());

create policy blog_posts_write_admin on public.blog_posts
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create trigger set_updated_at_blog_posts before update on public.blog_posts
  for each row execute function public.set_updated_at();

grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to service_role;

insert into public.blog_posts
  (slug, title, description, body, tags, published, published_at, youtube_url, videos)
values
  (
    'documents-that-delay-nigerian-imports',
    'The 3 documents that delay most Nigerian imports',
    'Form M, PAAR and SONCAP cause most port delays. Here is what each one is and when you need it.',
    '[
      "Most Nigerian import delays are not caused by shipping. They are caused by three documents that are missing, wrong, or out of order: Form M, the Pre-Arrival Assessment Report (PAAR), and SONCAP.",
      "Form M is registered with your bank before shipment. PAAR is generated from the Form M and the shipping documents so customs can assess duty. SONCAP proves that regulated products meet Nigerian standards.",
      "In this video we walk through the order they must be obtained in, the mistakes that get each one rejected, and the simple check that catches them before your container reaches the port."
    ]'::jsonb,
    '{"Nigeria","Import","Compliance"}'::text[],
    true,
    '2026-09-20'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  ),
  (
    'what-is-a-paar',
    'What is a PAAR and why does it cost you demurrage?',
    'A one-minute explanation of the Pre-Arrival Assessment Report and the errors that send it back.',
    '[
      "PAAR stands for Pre-Arrival Assessment Report. It is the document customs uses to assess duty on your goods before they arrive.",
      "It is generated from your Form M and the shipping documents. When the details on those documents disagree, the PAAR is rejected and your cargo sits at the port, accruing demurrage every single day.",
      "The fix is boring but effective: check that the invoice, packing list, bill of lading and Form M all agree before you submit. That is exactly what Lading''s consistency check does automatically."
    ]'::jsonb,
    '{"Nigeria","Customs","PAAR"}'::text[],
    true,
    '2026-09-18'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  ),
  (
    'fob-by-air-incoterm-mistake',
    'FOB by air: the Incoterm mistake that voids your insurance',
    'FOB and CIF are sea-only terms. Using them for air freight creates a risk gap you may not notice until a claim.',
    '[
      "FOB, FAS, CFR and CIF are written for sea and inland waterway transport only. They assume the goods move on a vessel.",
      "When you use FOB on an air shipment, the point where risk transfers becomes ambiguous. If the goods are damaged in transit, your insurer and the carrier can both point at the other party.",
      "For air, courier, road and rail, use FCA, CPT, CIP, DAP or DDP. Lading''s trade terms tool flags sea-only terms when you select a non-sea mode, before the contract is signed."
    ]'::jsonb,
    '{"Incoterms","Risk","Air freight"}'::text[],
    true,
    '2026-09-15'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  ),
  (
    'hs-code-wrong-digit-duty',
    'HS codes: how one wrong digit doubles your duty',
    'Classification drives duty, levies and permits. A single digit can change everything.',
    '[
      "The Harmonized System code on your declaration decides the duty rate, the levies, and which permits apply.",
      "Two products that look similar can sit under different headings with very different rates. A monitor and a television are not the same thing to customs. Neither are fresh and dried fruit.",
      "Lading''s AI assistant suggests candidate codes from a plain description, ranked by confidence, so you can check the likely options before you commit to a declaration."
    ]'::jsonb,
    '{"HS codes","Duty","Classification"}'::text[],
    true,
    '2026-09-12'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  ),
  (
    'five-minute-pre-shipment-check',
    'The 5-minute pre-shipment check that prevents demurrage',
    'Five checks across your document set that catch the errors that cost the most.',
    '[
      "Demurrage is what you pay for someone else''s paperwork error. The good news is that most of those errors are findable in five minutes.",
      "Check five things: the consignee name and address match across every document, the quantities and weights reconcile between the invoice and the packing list, the HS code is present and consistent, the Incoterm matches the mode, and the parties are screened.",
      "Lading runs these checks automatically and shows you exactly what to fix before anything reaches a customs desk."
    ]'::jsonb,
    '{"Consistency","Demurrage","Workflow"}'::text[],
    true,
    '2026-09-10'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  ),
  (
    'importing-into-nigeria-checklist',
    'Importing into Nigeria: the full document checklist',
    'Every document a Nigerian import needs, from Form M to the final clearance, in order.',
    '[
      "A Nigerian import typically needs a commercial invoice, a packing list, a bill of lading or air waybill, Form M, a PAAR, and a SONCAP certificate for regulated products.",
      "Food, drugs and cosmetics also need NAFDAC registration. Some goods need an import licence or a permit from another agency.",
      "Lading''s requirement checker takes the HS code, origin, destination and direction, and returns the documents and permits that apply, with the issuing authority and a source link."
    ]'::jsonb,
    '{"Nigeria","Import","Checklist"}'::text[],
    true,
    '2026-09-08'::timestamptz,
    'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
    '[
      {"platform":"youtube","url":"https://www.youtube.com/@lading"},
      {"platform":"tiktok","url":"https://www.tiktok.com/@lading"},
      {"platform":"instagram","url":"https://www.instagram.com/lading"},
      {"platform":"facebook","url":"https://www.facebook.com/lading"},
      {"platform":"threads","url":"https://www.threads.net/@lading"},
      {"platform":"bluesky","url":"https://bsky.app/profile/lading"}
    ]'::jsonb
  )
on conflict (slug) do nothing;
