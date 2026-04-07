ALTER TABLE public.watch_posts ALTER COLUMN watch_account_id DROP NOT NULL;
ALTER TABLE public.watch_posts ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'instagram';