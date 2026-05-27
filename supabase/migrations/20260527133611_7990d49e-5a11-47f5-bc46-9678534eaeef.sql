DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'watch_accounts'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_accounts;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'watch_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_posts;
  END IF;
END $$;