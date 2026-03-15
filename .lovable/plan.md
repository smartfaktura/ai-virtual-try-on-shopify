

## Fix: AI Analysis Fails with 401 in AddSceneModal

### Root Cause
The network request shows `create-scene-from-image` returning **401 Unauthorized**. The edge function validates the user's JWT token via `supabase.auth.getUser(token)`, but `AddSceneModal` sends the **anon key** (`VITE_SUPABASE_PUBLISHABLE_KEY`) instead of the logged-in user's session token.

### Fix

**`src/components/app/AddSceneModal.tsx`** (line 38-45):

Replace the raw `fetch` call with `supabase.functions.invoke`, which automatically attaches the user's session token:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Replace the fetch call:
const { data, error } = await supabase.functions.invoke('create-scene-from-image', {
  body: { imageUrl },
});
if (error) throw error;
```

This is a one-line logical change — swap `fetch` + anon key for `supabase.functions.invoke` which handles auth automatically. No other files need changes.

