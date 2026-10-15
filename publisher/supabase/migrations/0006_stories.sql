-- 0006_stories — daily quiz Instagram Stories.
--
-- A story is one JPEG card (kept in cover_path, the post's one image slot) with no caption, posted
-- to Instagram only. It carries the quiz it shows (`quiz`: publicSlug, title, chapter and the
-- tagged quiz links per place, from PYQ Vault's /api/quiz/today), so the story-reply DM and the
-- Telegram post link the SAME quiz as the card even if PYQ Vault's rotation moves mid-week.
-- `planned_for` is the morning it is meant for; approving schedules it then.
--
-- JPEG only: the Instagram API rejects a PNG story ("Only photo or video can be accepted",
-- code 9004, probed 2026-10-17). Stories vanish after 24 hours, so they get no 48 h / 7 d scorecard.

alter table public.posts add column quiz jsonb, add column planned_for timestamptz;

alter table public.posts drop constraint posts_kind_check;
alter table public.posts add constraint posts_kind_check check (kind in ('reel', 'carousel', 'story'));

alter table public.posts drop constraint posts_media_shape;
alter table public.posts add constraint posts_media_shape check (
  (kind = 'reel' and video_path is not null and cardinality(slide_paths) = 0)
  or (kind = 'carousel' and video_path is null and cardinality(slide_paths) between 2 and 10)
  or (kind = 'story' and video_path is null and cardinality(slide_paths) = 0 and cover_path is not null)
);

alter table public.posts add constraint posts_story_quiz check (
  (kind = 'story') = (quiz is not null)
  and (quiz is null or (jsonb_typeof(quiz) = 'object' and quiz ? 'publicSlug' and quiz ? 'links'))
);

alter table public.posts add constraint posts_story_jpeg check (kind <> 'story' or cover_path ~* '\.jpe?g$');

-- Same guard as 0001, plus the quiz: what you approved is what gets published and linked.
create or replace function private.guard_post_transition() returns trigger
language plpgsql as $$
begin
  if new.status <> old.status and not (
       (old.status = 'ready'    and new.status in ('approved', 'rejected'))
    or (old.status = 'approved' and new.status in ('ready', 'published', 'partially_published', 'failed'))
    or (old.status in ('partially_published', 'failed') and new.status = 'approved')
  ) then
    raise exception 'post % cannot go from % to %', old.id, old.status, new.status using errcode = 'check_violation';
  end if;
  if new.org_id <> old.org_id or new.project_id <> old.project_id or new.kind <> old.kind then
    raise exception 'post % cannot change org, project or kind', old.id using errcode = 'check_violation';
  end if;
  if old.status <> 'ready' and (new.captions is distinct from old.captions
      or new.video_path is distinct from old.video_path or new.cover_path is distinct from old.cover_path
      or new.slide_paths is distinct from old.slide_paths or new.quiz is distinct from old.quiz) then
    raise exception 'post % can only be edited while ready', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

-- Same as 0002 with one change: only a reel goes beyond Instagram (carousels and stories don't).
create or replace function public.approve_post(p_post uuid, p_platforms text[], p_scheduled_at timestamptz default null)
returns setof public.publications
language plpgsql security definer set search_path = '' as $$
declare
  v public.posts;
  pf text;
begin
  v := private.lock_member_post(p_post);
  if v.status <> 'ready' then perform private.fail('not_ready', format('Only a ready post can be approved (this one is %s).', v.status)); end if;
  if p_platforms is null or cardinality(p_platforms) = 0 then perform private.fail('no_platforms', 'Choose at least one platform.'); end if;
  if (select count(distinct x) from unnest(p_platforms) x) <> cardinality(p_platforms) then
    perform private.fail('duplicate_platform', 'A platform was chosen twice.');
  end if;
  foreach pf in array p_platforms loop
    if pf not in ('instagram', 'facebook', 'youtube') or (v.kind <> 'reel' and pf <> 'instagram') then
      perform private.fail('unsupported_platform', format('A %s can''t be published to %s yet.', v.kind, pf));
    end if;
    if not exists (select 1 from public.project_channels c where c.project_id = v.project_id and c.platform = pf) then
      perform private.fail('not_connected', format('%s isn''t connected for this project.', pf));
    end if;
  end loop;
  if p_scheduled_at is not null then
    if p_scheduled_at <= now() then perform private.fail('schedule_in_past', 'The scheduled time has already passed.'); end if;
    if p_scheduled_at > now() + interval '75 days' then perform private.fail('schedule_too_far', 'Schedule at most 75 days ahead.'); end if;
  end if;

  update public.posts
     set status = 'approved', approved_by = auth.uid(), approved_at = now(), scheduled_at = p_scheduled_at
   where id = v.id;

  return query
    insert into public.publications (org_id, post_id, platform, scheduled_at)
    select v.org_id, v.id, x, p_scheduled_at from unnest(p_platforms) x
    returning *;
end $$;

-- Same as 0004 minus stories.
create or replace function public.metrics_due(p_limit int default 10)
returns table (
  publication_id uuid, post_id uuid, platform text, external_ref text, external_id text,
  published_at timestamptz, snapshot text
)
language sql stable security definer set search_path = '' as $$
  select pb.id, pb.post_id, pb.platform, pb.external_ref, pb.external_id, pb.published_at, s.label
    from public.publications pb
    join public.posts p on p.id = pb.post_id
    cross join (values ('48h', interval '48 hours'), ('7d', interval '7 days')) as s(label, after)
   where pb.status = 'published'
     and p.kind <> 'story'
     and pb.published_at <= now() - s.after
     and not exists (select 1 from public.publication_metrics m where m.publication_id = pb.id and m.snapshot = s.label)
   order by pb.published_at, s.after
   limit greatest(1, least(p_limit, 50));
$$;
