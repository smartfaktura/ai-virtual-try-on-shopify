ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_accounts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_posts;

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);