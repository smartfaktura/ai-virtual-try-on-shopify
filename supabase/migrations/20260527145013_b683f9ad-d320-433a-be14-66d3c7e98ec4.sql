
-- 1. Remove the broken phantom-function cron (schedule-campaigns-tick edge function doesn't exist)
SELECT cron.unschedule('schedule-campaigns-tick');

-- 2. Add hourly Resend property refresh cron (calls resync-resend-audience with service-role from vault)
SELECT cron.schedule(
  'refresh-resend-properties',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://azwiljtrbtaupofwmpzb.supabase.co/functions/v1/resync-resend-audience',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
        LIMIT 1
      )
    ),
    body := jsonb_build_object('source', 'cron', 'time', now())
  ) AS request_id;
  $$
);
