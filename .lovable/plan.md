## Fix Realtime security findings

Two scanner errors will be resolved: missing RLS on `realtime.messages`, and `watch_accounts`/`watch_posts` being exposed via the Realtime publication.

### 1. Database migration

```sql
-- Stop streaming admin-only tables to Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_accounts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.watch_posts;

-- Lock down realtime.messages so only authenticated users can subscribe
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
```

Leaves `discover_presets` and `generated_videos` on the publication untouched.

### 2. Code change

In `src/hooks/useWatchAccounts.ts`, remove the two `postgres_changes` subscriptions on `watch_accounts` and `watch_posts` plus their channel setup/teardown. Mutations already call `refetchAccounts()` / `refetchPosts()`, and the admin Trend Watch page has a manual refresh button, so the UI keeps working.

### 3. Verification

- Confirm publication only contains `discover_presets` and `generated_videos`.
- Re-run the security scan — both findings should clear.
- Smoke-test Trend Watch admin (list loads, add/refresh works).

### Risk / rollback

Non-destructive. Rollback if needed:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_posts;
DROP POLICY "Authenticated users can receive realtime broadcasts" ON realtime.messages;
ALTER TABLE realtime.messages DISABLE ROW LEVEL SECURITY;
```

### Out of scope

No changes to `watch_*` table RLS (already admin-only), no changes to other realtime features.