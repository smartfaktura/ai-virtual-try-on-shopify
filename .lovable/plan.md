

## Replace Generic Error Toast with Informative Failure UI

### Problem
When a generation fails (content blocked, API error, timeout, etc.), the user sees a vague red toast: "Failed to generate any images". No explanation of what happened, no indication credits were refunded, no guidance on what to do next.

The backend content-blocked fix we just deployed should now correctly mark safety-blocked jobs as `completed` with `contentBlocked: true` — but there are still other failure scenarios (API errors, timeouts, rate limits) that fall through as generic `failed` status with unhelpful messages.

### Solution — 2 files

**1. `src/hooks/useGenerationQueue.ts`** — line 177-179

Replace the generic `toast.error()` with a smarter handler that:
- Detects content-blocked keywords in `error_message` (fallback if backend fix doesn't catch it) and sets a blocked entry instead of toasting
- For other failures, shows a descriptive toast with credit refund confirmation:
  - Timeout → "Generation timed out. Your X credits have been refunded."
  - API/server error → "Generation failed due to a server issue. Your credits have been refunded."
  - Generic → "Generation couldn't complete. Your credits have been refunded — try again."

Add an optional `onContentBlocked` callback parameter to the hook so Freestyle can inject its `setBlockedEntries` logic.

**2. `src/pages/Freestyle.tsx`** — line 425-428

Pass the `onContentBlocked` callback to `useGenerationQueue` so that even if a content-blocked job arrives as `failed` (edge case), it still renders the `ContentBlockedCard` instead of a toast.

Update the `failed` handler to NOT show a duplicate toast (since the queue hook now handles it).

### Error Message Mapping

| `error_message` contains | Toast shown |
|---|---|
| `content` / `safety` / `policy` / `prohibited` | → `ContentBlockedCard` (no toast) |
| `timed out` / `timeout` | "⏱ Generation timed out. Credits refunded." |
| `rate limit` / `concurrent` | "Too many generations at once. Credits refunded." |
| anything else | "Generation failed. Your credits have been refunded — try again." |

All failure toasts will include the refund confirmation so users know they weren't charged.

