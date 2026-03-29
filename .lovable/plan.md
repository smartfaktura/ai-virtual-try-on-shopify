

# Fix: Restrict `contact_submissions` INSERT to Block Anonymous Abuse

## Analysis

The `contact_submissions` table has an INSERT policy with `{public}` role and `WITH CHECK: true`, meaning anyone (including anonymous/unauthenticated users) can insert rows directly via the Supabase client, bypassing the edge function entirely. This enables spam and data poisoning.

However, all legitimate inserts go through the `send-contact` edge function, which uses `service_role` (bypasses RLS). No client code inserts directly into this table.

## Change (1 item)

### Replace the permissive INSERT policy

Drop the current open INSERT policy and replace it with one restricted to `service_role` only (or simply drop it, since `service_role` bypasses RLS). Dropping it is cleanest:

```sql
DROP POLICY "Anyone can insert contact submissions" ON public.contact_submissions;
```

This means only the `send-contact` edge function (via `service_role`) can insert. Direct client-side inserts from anonymous or authenticated users will be blocked.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop the open INSERT policy on `contact_submissions` |

No code changes needed — the edge function uses `service_role` which bypasses RLS.

