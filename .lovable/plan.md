

## Fix: "Add as Model" AI analysis fails — auth token mismatch

### Root cause

In `AddModelModal.tsx` line 41, the fetch uses the **anon/publishable key** as the Authorization bearer token:

```typescript
Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
```

But the edge function (`create-model-from-image`) calls `supabase.auth.getUser(token)` which requires the **user's session JWT**, not the anon key. The anon key fails auth validation → 401 → "AI analysis failed".

### Fix — `src/components/app/AddModelModal.tsx`

Replace the raw `fetch` with `supabase.functions.invoke`, which automatically attaches the logged-in user's JWT:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Replace the fetch block with:
const { data, error } = await supabase.functions.invoke('create-model-from-image', {
  body: { imageUrl },
});
if (error) throw error;
```

This sends the correct user auth token. Single file change, ~5 lines modified.

