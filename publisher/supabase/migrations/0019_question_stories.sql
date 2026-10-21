-- 0019_question_stories — a story can show one maths question instead of a quiz link.
--
-- @pyqvault_'s daily maths stories (founder 2026-10-21): a 07:30 card with the question and its four
-- options ("Reply A, B, C or D") and a 19:30 card with the answer. Made a week at a time by
-- stories/render.mjs and queued with `npm run queue:add`. Each card carries the question it shows
-- (`question`: the question bank's id, the right answer, and which card it is), so the answer card,
-- the replies and any later auto-reply are tied to the same question. A story shows a quiz OR a
-- question, never both, and neither can change once approved.

alter table public.posts add column question jsonb;

alter table public.posts drop constraint posts_story_quiz;
alter table public.posts add constraint posts_story_quiz check (
  (kind = 'story') = (num_nonnulls(quiz, question) = 1)
  and (quiz is null or (jsonb_typeof(quiz) = 'object' and quiz ? 'publicSlug' and quiz ? 'links'))
);

alter table public.posts add constraint posts_story_question check (
  question is null or (
    jsonb_typeof(question) = 'object' and question ? 'id'
    and question->>'answer' in ('A', 'B', 'C', 'D')
    and question->>'part' in ('question', 'answer')
  )
);

-- Same guard as 0006, plus the question: what you approved is what gets published.
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
      or new.question is distinct from old.question) then
    raise exception 'post % can only be edited while ready', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
