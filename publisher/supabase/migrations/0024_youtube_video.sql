-- 0024_youtube_video — a reel can carry a YouTube copy of its video.
--
-- House rule (reels/lwspune-insta.md): the end card says "Follow for more" on Instagram and
-- "Subscribe for more" on YouTube. A reel rendered both ways is queued with both files; YouTube
-- gets youtube_video_path when it's there, the main video otherwise. Like the other media, it is
-- frozen once the post is approved: what you approved is what gets published.

alter table public.posts
  add column youtube_video_path text,
  add constraint posts_youtube_video check (
    youtube_video_path is null or (kind = 'reel' and youtube_video_path like org_id::text || '/%' and youtube_video_path ~* '\.mp4$')
  );

-- Same guard as 0019, plus the YouTube video.
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
      or new.slide_paths is distinct from old.slide_paths or new.quiz is distinct from old.quiz
      or new.question is distinct from old.question or new.youtube_video_path is distinct from old.youtube_video_path) then
    raise exception 'post % can only be edited while ready', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
