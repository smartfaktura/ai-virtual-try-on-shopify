

# Fix: Add Explicit DELETE Guard on Profiles Table

## Analysis

- **INSERT**: Already correctly guarded — `WITH CHECK (auth.uid() = user_id)` prevents spoofing.
- **DELETE**: No policy exists. RLS default-deny already blocks all deletes. The scanner flags this as a risk, but it's functionally safe.
- **Risk level**: Low — defense-in-depth improvement only.

## Change

Single database migration to add an explicit DELETE policy that blocks all client-side deletes (only service_role can delete profiles, which bypasses RLS anyway):

```sql
CREATE POLICY "No client profile deletion"
  ON profiles FOR DELETE TO authenticated
  USING (false);
```

This makes the intent explicit: profiles cannot be deleted by any authenticated user. Service role (used by backend functions for account cleanup) bypasses RLS and remains unaffected.

No frontend code changes required.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Add explicit DELETE-deny policy on `profiles` table |

