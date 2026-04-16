

# Improve Step 2 (Expanded Panel) Mobile UX

## Problem
Step 2 chips and action buttons don't match the improved Step 1 mobile layout — chips are small with tight gaps, action buttons are right-aligned and undersized for touch targets.

## Changes

### `src/components/app/ContextualFeedbackCard.tsx` — Step 2 (Lines 208-265)

1. **Chips**: Increase gap from `gap-1.5` to `gap-2`, add `min-h-[36px] px-3 py-1.5` for better touch targets on mobile
2. **Textarea**: Increase to `text-sm` and `py-2.5` for comfortable typing on mobile
3. **Action buttons**: Center on mobile (`justify-center md:justify-end`), increase "Send feedback" to `min-h-[44px] px-6` and "Skip" to `min-h-[44px]` for proper touch targets
4. **Spacing**: Keep `space-y-3.5` which already works well

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Step 2: Larger chip touch targets, centered action buttons on mobile, proper min-h on Skip/Send |

