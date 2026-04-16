

# Fix Survey Card Layout in Image Detail Panel

## Problem
The survey feedback card overflows the sidebar panel on desktop/tablet because it tries to fit icon + badge + question text + 3 buttons in one horizontal row. The panel is only ~380px wide — not enough for an inline layout.

## Changes

### `src/components/app/ContextualFeedbackCard.tsx`

**Step 1 layout** — Force vertical (stacked) layout at all sizes. Remove `md:flex-row md:items-center md:justify-between` which causes the overflow. The card will always stack: header row → question → buttons.

Also change the badge text from "Survey" to "Help us improve" on `md:` screens while keeping "Survey" on mobile (or just use "Help us improve" everywhere since it fits).

Specific changes:
- **Line 154**: Remove `md:flex-row md:items-center md:justify-between md:gap-3 md:px-4 md:py-3` — keep it always `flex-col`
- **Line 159**: Change badge text — use a responsive approach: show "Survey" on mobile, "Help us improve" on desktop. Or simplify to just "Help us improve" everywhere.
- **Line 161**: Remove `hidden md:block` from the inline question text (since we're always stacking, the question goes on its own row)
- **Line 172**: Remove `md:hidden` from the mobile question text (or consolidate into one always-visible line)
- **Line 180**: Remove `md:flex-initial md:min-h-0 md:h-8` from buttons so they stay touch-friendly

Similarly update Step 2 expanded panel to remove desktop-specific overrides.

**Badge text options:**
1. "Help us improve" — clear, friendly
2. "Quick feedback" — action-oriented
3. "Your opinion" — personal

I'll go with **"Help us improve"** on `sm:` and up, keeping "Survey" on mobile for brevity.

### Summary

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Force vertical layout always; change badge to "Help us improve" on desktop/tablet |

