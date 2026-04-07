ALTER TABLE public.watch_accounts ADD COLUMN IF NOT EXISTS last_sync_cursor text DEFAULT '';

ALTER TABLE public.watch_posts ADD CONSTRAINT watch_posts_account_post_unique UNIQUE (watch_account_id, instagram_post_id);