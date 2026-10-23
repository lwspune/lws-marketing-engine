-- 0023_youtube_uploads — YouTube Shorts: resumable uploads that survive a run that gets cut off.
--
-- On YouTube a finished upload IS a posted video, so a cut-off run must never start a second upload.
-- The worker saves Google's resumable session (a link + the file size) before sending any bytes;
-- the next run asks Google how far that session got and finishes or records it.
--
-- Kept in the private schema, not on publications: a session link lets anyone holding it upload
-- into the channel for about a week, so only the worker (service role) reads or writes it.
-- Keyed by attempt, so a retried publication starts with no session.

create table private.upload_sessions (
  publication_id uuid not null references public.publications(id) on delete cascade,
  attempt int not null check (attempt >= 0),
  session_uri text not null check (session_uri ~ '^https://[a-z0-9.-]+\.googleapis\.com/' and length(session_uri) <= 2048),
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  primary key (publication_id, attempt)
);
alter table private.upload_sessions enable row level security;
revoke all on private.upload_sessions from public, anon, authenticated;

create or replace function public.save_upload_session(p_publication uuid, p_uri text, p_size bigint)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  pb public.publications;
begin
  if p_uri is null or p_uri !~ '^https://[a-z0-9.-]+\.googleapis\.com/' or length(p_uri) > 2048 or coalesce(p_size, 0) <= 0 then
    perform private.fail('invalid_session', 'An upload session needs a googleapis.com https link and a positive size.');
  end if;
  select * into pb from public.publications where id = p_publication for update;
  if not found or pb.status <> 'pending' or pb.platform <> 'youtube' then
    perform private.fail('invalid_transition', 'An upload session can only be saved for a pending YouTube publication.');
  end if;
  insert into private.upload_sessions (publication_id, attempt, session_uri, size_bytes)
  values (pb.id, pb.attempts, p_uri, p_size)
  on conflict (publication_id, attempt) do update
    set session_uri = excluded.session_uri, size_bytes = excluded.size_bytes, created_at = now();
end $$;

create or replace function public.upload_session(p_publication uuid)
returns table (session_uri text, size_bytes bigint)
language sql stable security definer set search_path = '' as $$
  select s.session_uri, s.size_bytes
    from private.upload_sessions s
    join public.publications pb on pb.id = s.publication_id and pb.attempts = s.attempt
   where s.publication_id = p_publication;
$$;

revoke all on function public.save_upload_session(uuid, text, bigint), public.upload_session(uuid) from public, anon, authenticated;
grant execute on function public.save_upload_session(uuid, text, bigint), public.upload_session(uuid) to service_role;
