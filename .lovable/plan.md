

## Save user email with feedback submissions

### Current state
- Both `FeedbackBanner` and `MissingRequestBanner` insert into the **same `feedback` table** — correct, all submissions go to one place.
- The table stores `user_id` but not the user's email directly. The email exists in `profiles.email` and can be joined via `user_id`.

### Decision: Add email column vs. join on profiles

Adding a denormalized `email` column to the `feedback` table is simpler for admin queries and future email notifications — no join needed. This is the approach I recommend.

### Changes

**1. Database migration** — Add `email` column to `feedback` table:
```sql
ALTER TABLE public.feedback ADD COLUMN email text;
```

**2. `src/components/app/FeedbackBanner.tsx`** — Include `user.email` in the insert:
```tsx
const { error } = await supabase.from('feedback').insert({
  user_id: user.id,
  type: selectedType,
  message: message.trim(),
  page_url: location.pathname,
  email: user.email,
});
```

**3. `src/components/app/MissingRequestBanner.tsx`** — Same change:
```tsx
const { error } = await supabase.from('feedback').insert({
  user_id: user.id,
  type: 'feature',
  message: `[${category}-request] ${message.trim()}`,
  page_url: location.pathname,
  email: user.email,
});
```

Both components already have access to `user` from `useAuth()`, and `user.email` is available from the auth session — no extra queries needed.

