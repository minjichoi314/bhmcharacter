-- ============================================================
-- FESTIVAL PAD GALLERY
-- Supabase SQL Editor에서 전체 실행
-- ============================================================

-- 0) 필요한 확장
create extension if not exists pgcrypto;

-- ============================================================
-- 1) 작품 테이블
-- ============================================================

create table if not exists public.artworks (
  id uuid primary key,
  event_id text not null,
  title text not null default '오늘의 한 장',
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

-- 기존 정책 제거
drop policy if exists "public read approved artworks" on public.artworks;
drop policy if exists "public insert artworks" on public.artworks;
drop policy if exists "public update artwork status" on public.artworks;

-- 승인 작품은 누구나 읽기
create policy "public read approved artworks"
on public.artworks
for select
to anon, authenticated
using (status = 'approved');

-- 패드에서 작품 등록
create policy "public insert artworks"
on public.artworks
for insert
to anon, authenticated
with check (
  char_length(event_id) between 1 and 80
  and char_length(title) <= 36
  and char_length(message) <= 180
  and status in ('approved','pending')
);

-- 테스트용 운영 정책
-- 실제 행사에서는 반드시 운영자 인증 기반으로 강화 권장
create policy "public update artwork status"
on public.artworks
for update
to anon, authenticated
using (true)
with check (
  status in ('approved','hidden','pending')
);

-- ============================================================
-- 2) Storage bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('artworks','artworks',true)
on conflict (id)
do update set public = true;

-- 기존 정책 제거
drop policy if exists "public upload artworks" on storage.objects;
drop policy if exists "public read artwork images" on storage.objects;
drop policy if exists "public delete own failed artwork" on storage.objects;

-- 이미지 업로드
create policy "public upload artworks"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'artworks'
);

-- 공개 이미지 읽기
create policy "public read artwork images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'artworks'
);

-- 업로드 후 DB 저장 실패 시 정리용 삭제 허용
-- 테스트/행사 MVP용. 실제 운영에서는 더 강한 정책 권장
create policy "public delete own failed artwork"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'artworks'
);

-- ============================================================
-- 3) Realtime
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'artworks'
  ) then
    alter publication supabase_realtime
    add table public.artworks;
  end if;
end $$;
