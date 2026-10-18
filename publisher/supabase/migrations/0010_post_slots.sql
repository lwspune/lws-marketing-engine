-- Posting slots (founder, 2026-10-18): approving a reel puts it in its project's next free slot
-- (src/lib/domain/slots.ts; @pyqvault_ posts 3 a day). Two approvals at once could both pick the same free slot,
-- so the database holds the rule: one scheduled post per project per moment. Stories are exempt (they have their
-- own 07:30 morning, one per day by the story planner); posting now (no time) never clashes.
create unique index posts_one_per_slot on public.posts (project_id, scheduled_at)
  where scheduled_at is not null and kind <> 'story';
