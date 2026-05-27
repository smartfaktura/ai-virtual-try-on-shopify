## Fix Realtime exposure on admin-only tables

### Problem
`watch_accounts` and `watch_posts` are published to Realtime but restricted to admins via RLS. Without `realtime.messages` policies, any authenticated user subscribing to these channel topics receives row-change broadcasts.

### Solution
Remove both tables from the Realtime publication. These tables are only read in the admin Trend Watch UI, which can poll or refetch on focus — no UI component subscribes to Realtime for them.

### Migration
```sql
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
```

### Why drop rather than add `realtime.messages` policies
- These tables are admin-only and polled via REST, not consumed via Realtime subscriptions.
- Adding `realtime.messages` RLS is heavier and unnecessary here.
- Dropping closes the side-channel cleanly while preserving REST access (already gated by RLS).

### Out of scope
- No code changes needed. `useWatchAccounts.ts` does not subscribe to Realtime for these tables.
- No changes to other Realtime tables.

### Verification
- Re-run security scan after migration to confirm finding resolved.