

## Plan: Fix chat session persistence (silent error swallowing)

### Problem
Chat messages are sent and received successfully, but sessions are not being saved to the `chat_sessions` table. The `persistSession` function has a `catch` block that silently swallows all errors, making it impossible to diagnose the failure.

### Root cause (most likely)
The `persistSession` function catches all errors and returns without logging. The insert could be failing due to:
- An RLS policy issue (though the policies look correct)
- A data serialization issue with the JSONB `messages` column
- The `setMessages` callback pattern triggering persist before auth state is ready

### Fix

**`src/hooks/useStudioChat.ts`** — Two changes:

1. **Add error logging** in `persistSession` catch block — replace the silent `catch {}` with `catch (e) { console.error('persistSession error:', e); }` so failures are visible in the console.

2. **Move persist out of `setMessages` callback** — The current pattern uses `setMessages(prev => { persistSession(...); return prev; })` which is a React anti-pattern (side effects inside state updaters). Instead, capture the current messages after the finally block and call `persistSession` directly. This ensures the persist call happens cleanly outside React's state update cycle.

Also log errors on the insert path (line 34) — if `error` is truthy, log it before returning null.

### Changes summary
- `src/hooks/useStudioChat.ts`: Add `console.error` in catch blocks, move persist call out of `setMessages`, and log insert/update errors explicitly.

