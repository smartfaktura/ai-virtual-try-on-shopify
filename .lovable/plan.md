

## Fix discover_item_views INSERT Policy

One-line RLS policy change: replace the open `WITH CHECK (true)` on `discover_item_views` INSERT with a constraint that forces `user_id` to match the authenticated user (or be NULL for anonymous views).

### Change

**Database migration:**
```sql
DROP POLICY "Anyone can insert views" ON public.discover_item_views;
CREATE POLICY "Anyone can insert views" ON public.discover_item_views
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
```

This prevents users from spoofing view records with other users' IDs while still allowing anonymous (NULL) inserts.

| File | Change |
|------|--------|
| Database migration | Replace INSERT policy on `discover_item_views` |

