

## Why tsimkus@inbox.lt Became Admin & How to Fix

### Root Cause

Both admin entries in the `user_roles` table were created at the **exact same timestamp** (`2026-02-10 09:18:45.232906+00`). This means they were inserted together in a single manual operation (likely during initial setup). There is **no trigger, no code, and no migration** that auto-assigns admin roles — this was a one-time manual data entry that included both accounts by mistake.

There is no bug to fix in the code. The `useIsAdmin` hook and all admin-gated UI work correctly — they check the `user_roles` table, and both accounts genuinely have the admin role there.

### Fix

Remove the admin role from `tsimkus@inbox.lt` via a data operation:

```sql
DELETE FROM public.user_roles
WHERE user_id = '381b6662-9d63-405e-a43d-172f0db6c3e9'
  AND role = 'admin';
```

This is a data change (not a schema change), so it uses the insert/data tool. After this, only `info@tsimkus.lt` will have admin access. No code changes needed.

### Files changed
- None (database data operation only)

