
-- Unschedule the cron job
SELECT cron.unschedule('send-feature-highlight-emails');

-- Drop the PL/pgSQL function
DROP FUNCTION IF EXISTS public.send_feature_highlight_emails();
