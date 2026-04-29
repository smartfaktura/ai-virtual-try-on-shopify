-- Schedule campaign + automation processing
SELECT cron.schedule(
  'schedule-campaigns-tick',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://azwiljtrbtaupofwmpzb.supabase.co/functions/v1/schedule-campaigns-tick',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d2lsanRyYnRhdXBvZndtcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTkzNzEsImV4cCI6MjA4NTM3NTM3MX0.w8Flgj4nld44gT4w-S_TSqzZ-FRPt4xTFiHm1U_c5VY'
    ),
    body := jsonb_build_object('time', now())
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'process-automation-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://azwiljtrbtaupofwmpzb.supabase.co/functions/v1/process-automation-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d2lsanRyYnRhdXBvZndtcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTkzNzEsImV4cCI6MjA4NTM3NTM3MX0.w8Flgj4nld44gT4w-S_TSqzZ-FRPt4xTFiHm1U_c5VY'
    ),
    body := jsonb_build_object('time', now())
  ) AS request_id;
  $$
);