

# Fix Inline Card Timer + X Button Overlap

## Changes

### 1. Increase appear delay from 3s to 7s
In `PostGenerationUpgradeCard.tsx` line 56, change `3000` → `7000`.

### 2. Fix X button overlapping with See Plans on desktop
The issue: on desktop the layout is a single row (`md:flex-row`). The content has `md:pr-3` but the absolute X button sits at `right-2`, overlapping the CTA button.

Fix: On desktop, move the X button inline into the flex row instead of absolute. Simpler approach — keep the absolute X but increase right padding on the desktop row to `md:pr-10` so the CTA has room, and the X sits outside the content flow.

Change line 82: add `md:pr-10` to the desktop layout so the dismiss button doesn't overlap:
- Current: `'flex-col gap-2 md:flex-row md:items-center md:gap-3 md:pr-3'`
- New: `'flex-col gap-2 md:flex-row md:items-center md:gap-3 md:pr-10'`

### Files
- `src/components/app/PostGenerationUpgradeCard.tsx` — 2 changes (lines 56, 82)

