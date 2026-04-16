

# Fix: Freestyle Survey Not Showing on 3rd Generation

## Root Cause

The generation counter (`vovv_fb_gen_count_freestyle`) is incremented inside `useEffect` every time the component mounts or `dismissKey` changes. Since `dismissKey` includes `resultId` (which is `activeJob?.id`), any change to the active job — including intermediate state transitions — increments the counter. The component can also unmount/remount when `showSceneHint` toggles. By the user's actual 3rd generation, the counter has likely already exceeded 3.

## Fix

Move the generation counting **out of the feedback component** and into the Freestyle page itself. The page already knows when a new generation completes. Increment a `sessionStorage` counter there (once per completed generation), then pass a `showFeedback` prop to the card instead of having the card count internally.

### Changes

**`src/pages/Freestyle.tsx`**
- After a generation completes (when `savedImages` updates with new results), increment `sessionStorage` counter `vovv_fb_gen_count_freestyle`
- Compute `showFreestyleFeedback = count === 3` and only render `ContextualFeedbackCard` when true

**`src/components/app/ContextualFeedbackCard.tsx`**
- Remove the freestyle-specific counting logic from `useEffect` (lines 56-63)
- The freestyle gating is now handled by the parent — the component just checks `dismissKey` and shows after the 2s delay

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Add generation counter logic, gate feedback card rendering on count === 3 |
| `src/components/app/ContextualFeedbackCard.tsx` | Remove freestyle counter from useEffect |

