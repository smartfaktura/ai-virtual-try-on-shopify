

## Secure Studio Chat Against Abuse

### Current Security Status
- **Auth**: JWT validation via `supabase.auth.getUser()` — only registered users can call it. This is correct.
- **Rate limiting**: NONE. A logged-in user or bot with stolen credentials can fire thousands of requests per minute, each consuming AI credits.
- **Input validation**: NONE. No limit on message count, message length, or payload size.

### Vulnerabilities
1. **No per-user rate limit** — authenticated user can spam unlimited requests
2. **No message history cap** — client sends full conversation history; 100+ messages = massive token cost per request
3. **No message length limit** — single message could be 100KB of text, inflating token usage
4. **Client controls message array** — attacker could inject fake assistant messages or manipulate history

### Plan

#### 1. Add server-side rate limiting in `supabase/functions/studio-chat/index.ts`

Use in-memory rate limiting (Map with user_id → timestamps). Limits:
- **20 messages per 5 minutes** per user (generous for real use, blocks bots)
- **60 messages per hour** per user (prevents sustained abuse)

```typescript
const rateLimits = new Map<string, number[]>();
const MAX_PER_5MIN = 20;
const MAX_PER_HOUR = 60;
```

Clean up old entries on each request to prevent memory leaks.

#### 2. Add input validation in the same edge function

- **Max 30 messages** in conversation history (trim older messages, keep system prompt fresh)
- **Max 2000 characters** per individual message
- **Max total payload ~50KB** — reject oversized requests early
- Strip any messages that aren't `role: 'user' | 'assistant'` (prevent system prompt injection)

#### 3. Add client-side throttle in `src/hooks/useStudioChat.ts`

- Disable send button while loading (already done via `isLoading`)
- Add a **2-second cooldown** between sends to prevent accidental rapid-fire
- Cap conversation at 30 messages client-side with a "Start new chat" prompt

### Files Changed — 2

**`supabase/functions/studio-chat/index.ts`**:
- Add in-memory rate limiter (per user_id, sliding window)
- Add input validation (message count cap, length cap, role sanitization)
- Return 429 with friendly message when rate limited

**`src/hooks/useStudioChat.ts`**:
- Add 2-second cooldown between sends
- Cap conversation at 30 messages with auto-suggestion to clear

### Why In-Memory Rate Limiting Is Sufficient
Edge functions on Lovable Cloud run as single instances with warm starts. An in-memory Map provides effective rate limiting without needing a database table. If the function cold-starts, the rate limit resets — this is acceptable since cold starts are infrequent and the primary goal is blocking sustained abuse, not perfect accounting.

