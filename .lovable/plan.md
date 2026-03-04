

## Fix Studio Chat "Unauthorized" Error

### Root Cause
In `src/hooks/useStudioChat.ts` line 30, the Authorization header is set to:
```
Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
```
This sends the **anon key** (a static project key), not the user's JWT. The edge function then calls `supabase.auth.getUser(token)` with the anon key, which naturally fails with "Unauthorized".

### Fix
**`src/hooks/useStudioChat.ts`** — Get the user's session token before making the request:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Inside sendMessage, before fetch:
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  throw new Error('Please sign in to chat with the studio team');
}

// Then use session.access_token in the Authorization header:
Authorization: `Bearer ${session.access_token}`,
```

Also add `apikey` header with the anon key (required by the backend gateway):
```typescript
apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
```

### Files changed — 1
- `src/hooks/useStudioChat.ts`: Replace anon key with user's session JWT in Authorization header, add `apikey` header

