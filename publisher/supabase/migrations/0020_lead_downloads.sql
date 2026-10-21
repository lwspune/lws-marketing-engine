-- 0020_lead_downloads — "Download for Excel" asks: all leads, or only those added since your last download (founder,
-- 2026-10-21). Each owner's downloads are recorded here; the latest one is their download point. `downloaded_at` is the
-- moment the file's leads were read up to, so the next "new" download starts exactly there. Written only through
-- record_lead_download, after the file is built (src/lib/leads/export.ts); each person reads only their own.

create table public.lead_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('all', 'new')),
  lead_count int not null check (lead_count >= 0),
  -- For a "new" download, the point it started from (null: everything).
  since timestamptz,
  downloaded_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint lead_downloads_since_before check (since is null or since < downloaded_at)
);
create index lead_downloads_user_idx on public.lead_downloads(user_id, downloaded_at desc);

alter table public.lead_downloads enable row level security;
create policy lead_downloads_read on public.lead_downloads for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete, truncate on public.lead_downloads from authenticated, anon;

create or replace function public.record_lead_download(p_kind text, p_count int, p_since timestamptz, p_at timestamptz)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.org_members m where m.user_id = auth.uid() and m.role = 'owner') then
    perform private.fail('forbidden', 'Only owners can download leads.');
  end if;
  -- A minute's grace for the app server's clock.
  if p_at is null or p_at > now() + interval '1 minute' then perform private.fail('invalid_input', 'The download time is not valid.'); end if;
  insert into public.lead_downloads (user_id, kind, lead_count, since, downloaded_at)
  values (auth.uid(), p_kind, p_count, p_since, p_at);
end $$;

revoke all on function public.record_lead_download(text, int, timestamptz, timestamptz) from public, anon;
grant execute on function public.record_lead_download(text, int, timestamptz, timestamptz) to authenticated;
