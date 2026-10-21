-- 0015_story_metrics — a daily quiz Story's numbers, saved at 23 hours.
--
-- Instagram deletes a story's insights about 24 hours after it goes up (checked 2026-10-21: the
-- 16 and 19 Oct stories answered "object does not exist", the 20 Oct one still answered), so a
-- story gets one snapshot, '23h', instead of the reels' 48 h / 7 d, with the numbers a story has:
-- replies, follows, profile visits and taps out. Same write-once table, same per-minute tick
-- (trigger_publisher already wakes the app whenever metrics_due has a row).

alter table public.publication_metrics drop constraint publication_metrics_snapshot_check;
alter table public.publication_metrics add constraint publication_metrics_snapshot_check
  check (snapshot in ('48h', '7d', '23h'));

alter table public.publication_metrics
  add column replies bigint check (replies >= 0),
  add column follows bigint check (follows >= 0),
  add column profile_visits bigint check (profile_visits >= 0),
  add column exits bigint check (exits >= 0),
  add constraint publication_metrics_story_columns check (
    snapshot = '23h' or (replies is null and follows is null and profile_visits is null and exits is null)
  );

-- '23h' exactly when the post is a story.
create or replace function private.guard_metrics_kind() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (new.snapshot = '23h') is distinct from exists (
    select 1 from public.publications pb join public.posts p on p.id = pb.post_id
     where pb.id = new.publication_id and p.kind = 'story'
  ) then
    raise exception 'the 23h snapshot is for stories, and a story gets only the 23h snapshot (publication %)', new.publication_id
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger publication_metrics_kind before insert on public.publication_metrics
  for each row execute function private.guard_metrics_kind();

-- Same as 0006 plus the stories' 23h snapshot.
create or replace function public.metrics_due(p_limit int default 10)
returns table (
  publication_id uuid, post_id uuid, platform text, external_ref text, external_id text,
  published_at timestamptz, snapshot text
)
language sql stable security definer set search_path = '' as $$
  select pb.id, pb.post_id, pb.platform, pb.external_ref, pb.external_id, pb.published_at, s.label
    from public.publications pb
    join public.posts p on p.id = pb.post_id
    cross join (values ('48h', interval '48 hours', false), ('7d', interval '7 days', false), ('23h', interval '23 hours', true))
      as s(label, after, story)
   where pb.status = 'published'
     and (p.kind = 'story') = s.story
     and pb.published_at <= now() - s.after
     and not exists (select 1 from public.publication_metrics m where m.publication_id = pb.id and m.snapshot = s.label)
   order by pb.published_at, s.after
   limit greatest(1, least(p_limit, 50));
$$;

create or replace function public.record_story_metrics(
  p_publication uuid,
  p_views bigint, p_reach bigint, p_shares bigint, p_replies bigint, p_follows bigint, p_profile_visits bigint, p_exits bigint,
  p_error text, p_raw jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.publication_metrics
    (org_id, publication_id, snapshot, views, reach, shares, replies, follows, profile_visits, exits, error, raw)
  select pb.org_id, pb.id, '23h', p_views, p_reach, p_shares, p_replies, p_follows, p_profile_visits, p_exits,
         left(p_error, 2000), coalesce(p_raw, '{}'::jsonb)
    from public.publications pb
   where pb.id = p_publication and pb.status = 'published'
  on conflict (publication_id, snapshot) do nothing;
end $$;

revoke all on function public.record_story_metrics(uuid, bigint, bigint, bigint, bigint, bigint, bigint, bigint, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_story_metrics(uuid, bigint, bigint, bigint, bigint, bigint, bigint, bigint, text, jsonb)
  to service_role;
revoke all on function private.guard_metrics_kind() from public, anon, authenticated;

-- The 20 Oct story (Probability), read by hand at 07:29 IST on 2026-10-21, minutes before Instagram
-- deleted it. Does nothing where that publication doesn't exist.
select public.record_story_metrics(pb.id, 206, 163, 0, 0, 1, 17, 115, null,
  '{"note": "read by hand on 2026-10-21 07:29 IST", "navigation": {"tap_forward": 69, "tap_exit": 115, "swipe_forward": 10, "tap_back": 1}}'::jsonb)
  from public.publications pb
 where pb.platform = 'instagram' and pb.external_id = '18640960741017963';
