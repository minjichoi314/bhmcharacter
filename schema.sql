create extension if not exists pgcrypto;

create table if not exists public.artworks (
  id uuid primary key,
  event_id text not null,
  title text not null default '축제 참여 작품',
  message text not null default '',
  image_url text not null,
  storage_path text not null,
  device_id text,
  status text not null default 'approved'
    check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists artworks_event_created_idx
  on public.artworks(event_id, created_at desc);

create index if not exists artworks_event_status_created_idx
  on public.artworks(event_id, status, created_at desc);

alter table public.artworks enable row level security;

drop policy if exists "public read approved artworks" on public.artworks;
drop policy if exists "public insert artworks" on public.artworks;
drop policy if exists "public update artwork status" on public.artworks;

create policy "public read approved artworks"
on public.artworks for select
to anon, authenticated
using (status = 'approved');

create policy "public insert artworks"
on public.artworks for insert
to anon, authenticated
with check (
  char_length(event_id) between 1 and 80
  and char_length(title) <= 36
  and char_length(message) between 1 and 180
  and status in ('approved','pending')
);

create policy "public update artwork status"
on public.artworks for update
to anon, authenticated
using (true)
with check (status in ('approved','hidden','pending'));

insert into storage.buckets (id,name,public)
values ('artworks','artworks',true)
on conflict (id) do update set public = true;

drop policy if exists "public upload artworks" on storage.objects;
drop policy if exists "public read artwork images" on storage.objects;
drop policy if exists "public delete failed artwork" on storage.objects;

create policy "public upload artworks"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'artworks');

create policy "public read artwork images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'artworks');

create policy "public delete failed artwork"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'artworks');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'artworks'
  ) then
    alter publication supabase_realtime add table public.artworks;
  end if;
end $$;
