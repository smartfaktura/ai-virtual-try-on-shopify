

# Fix Feedback Survey — Mobile Layout + Reposition in Product Images

## Changes

### 1. Mobile-responsive Step 1 layout (`ContextualFeedbackCard.tsx`)
The current pill uses `rounded-full` with `whitespace-nowrap` and horizontal layout — on mobile it overflows or gets cramped. Fix:

- **Step 1**: Switch from single-row pill to a stacked card on mobile:
  - Outer: `rounded-xl` instead of `rounded-full` (pills can't wrap nicely)
  - Question text: remove `whitespace-nowrap`, allow natural wrapping
  - Buttons row: `flex flex-wrap gap-1.5` with `flex-1 min-w-[70px] text-center` so they fill available width evenly
  - Keep the same muted styling (`bg-muted/80 backdrop-blur-sm border-border/50 shadow-sm`)

- **Success pill**: stays as-is (short text, always fits)

### 2. Move feedback below action buttons in Product Images (`ProductImagesStep6Results.tsx`)
Currently at line 112, the `ContextualFeedbackCard` sits between the header and the image grid. Move it after the action buttons Card (after line 181), so the flow is:

```
Header → Image Grid → Action Buttons → Feedback Survey
```

This puts it in a natural "post-action" position where users have already seen their results and decided what to do.

## Files
| File | Change |
|------|--------|
| `ContextualFeedbackCard.tsx` | Lines 145-167: Replace pill layout with mobile-friendly stacked card — `rounded-xl`, no whitespace-nowrap, flex-wrap buttons with flex-1 |
| `ProductImagesStep6Results.tsx` | Move lines 111-121 (feedback card) to after line 181 (after the actions Card) |

