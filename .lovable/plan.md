

## Social Login Post-Auth Issues Analysis

After tracing through the code, here are the findings:

### Issue 1: Social login redirect works correctly (no bug)

The OAuth flow sets `redirect_uri` to `/app`. When the user returns after social login:
- `AuthContext.onAuthStateChange` fires with the new session
- `ProtectedRoute` checks `profiles.onboarding_completed` (defaults to `false`)
- User is correctly redirected to `/onboarding`

This is working as designed. After onboarding, users reach the dashboard.

### Issue 2: `display_name` not saved to profile for social users

The `handle_new_user` trigger only inserts `user_id`, `email`, and `credits_balance`. For social login (Google/Apple), the user's name is available in `NEW.raw_user_meta_data->>'full_name'` or `'name'`, but the trigger ignores it. This means the Dashboard greets social users with "Welcome, there" instead of their actual name.

**Fix**: Update the `handle_new_user` trigger to extract display_name from OAuth metadata:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, credits_balance, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    20,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;
```

### Issue 3: Old product images using expired signed URLs

Some older products (created in February) have `image_url` values with signed tokens (`?token=eyJ...`). The `product-uploads` bucket is **public**, so these signed URLs are unnecessary. However, if the tokens expire, the URLs may still work since the bucket is public (Supabase serves public bucket files regardless of token validity). This is likely **not a real issue** since public buckets serve files without auth.

### Recommended Changes

1. **Database migration**: Update `handle_new_user` trigger to capture OAuth display name
2. **No code changes needed** for the redirect flow -- it works correctly

