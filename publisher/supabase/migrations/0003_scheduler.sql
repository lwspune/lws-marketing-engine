-- 0003_scheduler — call the publisher every minute from Supabase (pg_cron + pg_net).
--
-- Vercel Hobby only allows daily cron jobs, so the tick comes from the database instead. The
-- endpoint URL and its shared secret are stored in Vault, because the URL is only known after the
-- first Vercel deploy:
--
--   select vault.create_secret('https://<app>.vercel.app/api/cron/publish', 'publisher_cron_url');
--   select vault.create_secret('<same value as CRON_SECRET in Vercel>',   'publisher_cron_secret');
--
-- Until both exist the job does nothing, so applying this migration early is harmless.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create or replace function private.trigger_publisher() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  -- Skip the call entirely when nothing is due or in flight: most minutes cost nothing.
  if not exists (
    select 1 from public.publications pb join public.posts p on p.id = pb.post_id
     where p.status = 'approved'
       and ((pb.status = 'pending' and (pb.scheduled_at is null or pb.scheduled_at <= now())) or pb.status = 'processing')
  ) then return; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

revoke all on function private.trigger_publisher() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'publisher-tick';
select cron.schedule('publisher-tick', '* * * * *', $$select private.trigger_publisher()$$);
