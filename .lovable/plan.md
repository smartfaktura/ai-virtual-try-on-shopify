
## Problem
On the Dashboard, the "Create now / Start creating" button shows a **pulsing skeleton bar** every time you land on `/app` (often the second loading flash you see, after the greeting). It's gated on two queries:
1. `dashboard-profile` (for first name)
2. `dashboard-has-generated` (to decide "Create now" vs "Start creating")

Until both resolve, the button is `disabled` and shows `animate-pulse`. Looks like a bug, even on fast loads.

## Fix
Show the button **immediately** with a sensible default label, and let it update silently when data arrives. No skeleton, no disabled state.

### Change in `src/pages/Dashboard.tsx`

1. **Default the label optimistically**: assume returning user (most users are after first session) → label is `"Create now"`. If `hasGenerated === false` later resolves, swap to `"Start creating"` without flashing.
2. **Remove `disabled={!greetingReady}`** on the Product Visuals button — navigation works regardless of profile load state.
3. **Remove the inner `animate-pulse` span** — always render the label + arrow.
4. Apply the same treatment to any sibling card buttons that wait on `greetingReady` (only the first card does).
5. Keep the greeting headline skeleton as-is (that one's fine — it's text content, not an interactive control, and it's fast).

### Result
- Button is clickable on first paint
- Label may switch from "Create now" → "Start creating" once for brand-new users (rare, one-time)
- No more secondary loading flash on the primary CTA

## Out of scope
- Greeting skeleton (acceptable)
- Other dashboard sections (Discover, Recent Creations) — they have their own loading states which are appropriate
- Query caching changes (already 5 min staleTime)
