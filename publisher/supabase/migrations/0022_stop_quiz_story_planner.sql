-- 0022_stop_quiz_story_planner — founder, 2026-10-23: @lws.pune's daily quiz-link stories brought no
-- leads, so from 24 Oct @lws.pune posts a daily NDA maths question instead (made in ../stories/lwspune/,
-- queued with queue:add, like @pyqvault_'s). The Saturday job that queued a week of quiz stories (0007)
-- stops. Its function and /api/cron/stories stay, so it can come back with one cron.schedule line:
--   select cron.schedule('stories-weekly', '30 12 * * 6', $$select private.trigger_story_planner()$$);

select cron.unschedule(jobid) from cron.job where jobname = 'stories-weekly';
