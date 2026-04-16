

# Show Feedback Survey Every 3rd Generation + Add "Survey" Badge

## Problem
1. The feedback card shows after **every** generation — too repetitive for Freestyle/Product Images where users generate many times per session
2. The new banner design lost the "Survey" or "HELP US IMPROVE" label that the old design had — it just shows the icon + question with no context badge

## Changes

### 1. Show only on every 3rd generation (`ContextualFeedbackCard.tsx`)
- Add a `sessionStorage` counter per workflow: `vovv_fb_gen_count_{workflow}`
- On mount, increment the counter. Only show the card when `count % 3 === 0` (i.e., 3rd, 6th, 9th generation)
- First two generations: skip silently. Third: show the survey
- This keeps the per-resultId dismiss logic intact — if shown and dismissed, it stays dismissed for that specific result

### 2. Add "Survey" badge to Step 1 banner
- Add a small `Badge` with text "Survey" (or "HELP US IMPROVE") next to the `MessageSquarePlus` icon, before the question text
- Style: `variant="secondary"` with `text-[10px] uppercase tracking-wider font-semibold` to match the platform's label aesthetic
- This gives users context that it's a quick survey, not a random UI element

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Add generation counter logic (lines 50-57), add "Survey" badge to Step 1 (line 156-158) and Step 2 header |

