

# Fix Buy Credits Modal: Layout, Math, and CRO Improvements

## Problems Identified

1. **Broken savings math**: The savings calculation uses 2.6 cents/credit as the top-up comparison rate, but 2,500 credits at that rate = $65, which is LESS than the $79 Growth plan. This shows "Save $-14/month" -- a negative number that actively discourages upgrading.

2. **Progress bar overflow**: User has 180 credits on a Free plan (20 credits quota). The math `180/20 = 900%` caps at 100%, making the bar look completely full. This is confusing -- it looks like they've used everything when they actually have plenty.

3. **Modal too tall / overflows**: The Upgrade tab has too much vertical content (plan card + savings box + 5 features + button + alt plan + separator + compare link), causing it to overflow the viewport.

4. **Weak CRO on Upgrade tab**: For a free user, the upgrade pitch buries the value proposition under a broken savings box and generic feature list.

---

## Changes

### File: `src/components/app/BuyCreditsModal.tsx` -- Full Rewrite

**Balance section (top)**:
- Keep compact: plan badge, credit count, quota
- Fix progress bar: for free users where balance exceeds monthlyCredits, show a green "bonus" bar with a label like "180 credits available" without the misleading ratio
- When balance > monthlyCredits, show progress as 100% with a subtle "bonus credits" note

**Top Up tab**:
- Keep the 3-column credit pack grid
- Each pack shows: credits, image count, price, per-credit rate, buy button
- Remove "after purchase" line to reduce clutter
- Keep "Credits never expire" note

**Upgrade Plan tab -- CRO-optimized**:
- Remove the broken savings calculation entirely
- Replace with a value-focused pitch: highlight **feature unlocks** (Virtual Try-On, Video, Bulk Generation) not cost comparisons
- For free users: show Growth as the primary recommendation with a clear "What you unlock" section
- Show Starter as a compact alternative below
- Tighten spacing: reduce padding, use smaller text where appropriate
- Add `max-h` with `overflow-y-auto` on the tab content to prevent modal overflow
- Keep "Compare all plans in Settings" link at bottom

**Dialog sizing**:
- Add `max-h-[85vh]` and `overflow-y-auto` to the dialog content wrapper to handle any overflow gracefully

### File: `src/components/app/CreditIndicator.tsx` -- Minor Fix

- Fix progress bar logic: when `balance > monthlyCredits` (free user with bonus credits), cap the visual at 100% but use a different color tint to indicate "over quota" in a positive way
- No structural changes needed, just the progress calculation

