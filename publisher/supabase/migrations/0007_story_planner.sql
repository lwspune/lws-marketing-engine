-- 0007_story_planner — every Saturday at 18:00 IST (12:30 UTC), queue next Monday–Sunday's daily
-- quiz Stories as Ready by calling /api/cron/stories (same URL base and secret as the publisher
-- tick, migration 0003). The founder approves the week; nothing posts without that.

create or replace function private.trigger_story_planner() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  perform net.http_post(
    url := replace(v_url, '/api/cron/publish', '/api/cron/stories'),
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

revoke all on function private.trigger_story_planner() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'stories-weekly';
select cron.schedule('stories-weekly', '30 12 * * 6', $$select private.trigger_story_planner()$$);
