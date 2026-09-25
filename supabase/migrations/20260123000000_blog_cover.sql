alter table public.blog_posts
  add column if not exists cover_url text;

insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

drop policy if exists blog_public_select on storage.objects;
create policy blog_public_select on storage.objects
  for select using (bucket_id = 'blog');

drop policy if exists blog_insert_admin on storage.objects;
create policy blog_insert_admin on storage.objects
  for insert with check (
    bucket_id = 'blog'
    and public.is_platform_admin()
  );

drop policy if exists blog_delete_admin on storage.objects;
create policy blog_delete_admin on storage.objects
  for delete using (
    bucket_id = 'blog'
    and public.is_platform_admin()
  );
