

## Show User Email in Admin Feedback Panel

### Problem
The admin panel currently shows a truncated `user_id` (e.g., `fe45fd27…`). The `profiles` table has `email` but its RLS only allows users to read their own profile, so admins can't query it directly for other users.

### Solution

1. **New database function** — Create a `SECURITY DEFINER` function `get_user_emails_for_admin` that accepts an array of user_ids and returns `{user_id, email}` pairs, but only if the caller is an admin.

2. **Update AdminFeedbackPanel** — After fetching feedback items, collect unique `user_id`s and call the new function via `supabase.rpc()`. Build a lookup map and display email instead of truncated ID.

### Changes

| Action | Location | Detail |
|--------|----------|--------|
| Migration | DB function | `get_user_emails_for_admin(uuid[])` — security definer, checks `has_role(auth.uid(), 'admin')`, returns `user_id, email` from profiles |
| Edit | `AdminFeedbackPanel.tsx` | After fetching items, call RPC to get emails; display email in each feedback row instead of truncated user_id |

### DB Function

```sql
CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.email
  FROM public.profiles p
  WHERE p.user_id = ANY(p_user_ids)
    AND public.has_role(auth.uid(), 'admin'::app_role);
$$;
```

### UI Change

Replace `{item.user_id?.slice(0, 8)}…` with the resolved email (fallback to truncated ID if not found). Fetch emails in a separate `useQuery` keyed on the item user_ids.

