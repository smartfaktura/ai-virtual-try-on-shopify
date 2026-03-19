

## Show Raw Error to Admin + Friendly Public Messages on Generation Failure

### What Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

1. **Admin error detail**: In the `GenerationFailedCard` component, after the existing body text, conditionally render the raw `entry.message` in a monospace/code block when `useIsAdmin().isAdmin` is true. This gives you visibility into the actual error (e.g., "AI Gateway error: 503, error code: 1102") without exposing it to regular users.

2. **Friendlier public messages**: Update the `FAILED_MESSAGES` map:
   - `rate_limit`: Change body from "Try again in a moment. Credits refunded." to something like: "Our AI is processing a high volume of requests right now. Your credits have been refunded — try again in a minute or two."
   - `generic`: Update to: "Something unexpected happened on our end. Credits refunded — try again shortly."
   - `timeout`: Keep as-is (already friendly).

### Technical Detail

- `useIsAdmin()` is already imported in this file
- `entry.message` already contains the raw `error_message` from the queue job (passed through `onGenerationFailed` callback)
- The admin detail block will be a small `text-[9px] font-mono` section below the body, styled subtly (e.g., `bg-white/5 rounded p-2 text-white/30`) so it doesn't dominate the card
- No database or backend changes needed

### Files Changed
- `src/components/app/freestyle/FreestyleGallery.tsx` only

