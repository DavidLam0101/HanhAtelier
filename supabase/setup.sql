-- One-time Supabase setup for the HanhAtelier site.
-- 1. Owner's login email: lntd6534@gmail.com (used in 3 places below).
-- 2. Paste this whole file into Supabase → SQL Editor → Run.

-- Site content: one row per section (cards, prices, footer, profile, ...)
create table if not exists public.site (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site enable row level security;

drop policy if exists "Anyone can read the site" on public.site;
create policy "Anyone can read the site"
  on public.site for select
  using (true);

drop policy if exists "Only the owner can change the site" on public.site;
create policy "Only the owner can change the site"
  on public.site for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'lntd6534@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'lntd6534@gmail.com');

-- Photos: public to view, only the owner can upload
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can view photos" on storage.objects;
create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "Only the owner can upload photos" on storage.objects;
create policy "Only the owner can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and (auth.jwt() ->> 'email') = 'lntd6534@gmail.com');
