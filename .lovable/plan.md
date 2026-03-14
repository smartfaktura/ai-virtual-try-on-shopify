

## Fix: AI Analysis 401 Error on Paste Upload

### Root Cause

The `UploadSourceCard.tsx` sends the **anon key** (`VITE_SUPABASE_PUBLISHABLE_KEY`) as the Authorization header when calling `analyze-product-image`. But the edge function validates the token as a **user session JWT** via `supabase.auth.getUser()`. The anon key is not a user token, so it always returns 401.

Other components (e.g., `StoreImportTab`, `ChatContactForm`) correctly use `supabase.auth.getSession()` to get the user's access token.

### Fix

**`src/components/app/UploadSourceCard.tsx`**

1. Import `supabase` from `@/integrations/supabase/client`
2. In `analyzeProduct()`, replace the hardcoded anon key with the user's session access token:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session?.access_token) throw new Error('Not authenticated');
   // Use session.access_token in Authorization header
   Authorization: `Bearer ${session.access_token}`
   ```

This is a one-line fix in the `analyzeProduct` function — swap the anon key for the real user token. No other files need changes.

