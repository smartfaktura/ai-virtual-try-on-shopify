

# Unify Feedback Survey Styling Across All Steps

## Problem
Step 2 (expanded panel) uses `bg-card/95 shadow-lg` — a white card with heavy shadow — while Step 1 uses `bg-muted/80 shadow-sm`. This creates a jarring visual shift when clicking "No" or "Almost". The container also has `hover:shadow-md` which isn't needed since only the buttons should have hover states.

## Changes

### 1. Match Step 2 container to Step 1 style
- Change `bg-card/95 shadow-lg` → `bg-muted/80 shadow-sm` to match Step 1's muted treatment
- Keep `rounded-xl border border-border/50 backdrop-blur-sm`
- Add "Help Us Improve" label header consistent with Step 1

### 2. Remove container hover on Step 1
- Remove `hover:shadow-md transition-shadow` from the Step 1 outer div — buttons already have their own hover states

### 3. Tone down Step 2 chips and buttons
- Selected chips: keep `bg-primary text-primary-foreground` (these are interactive selections, appropriate)
- "Send feedback" button: change from `bg-primary text-primary-foreground` to a subtler style matching the muted theme — `bg-foreground/90 text-background` (dark but not branded-primary)
- Or keep primary if it matches the brand — but ensure it doesn't clash with the muted container

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Line 146: remove `hover:shadow-md transition-shadow`; Lines 199: change `bg-card/95 shadow-lg` → `bg-muted/80 shadow-sm`; Line 203: add "Help Us Improve" prefix to header |

