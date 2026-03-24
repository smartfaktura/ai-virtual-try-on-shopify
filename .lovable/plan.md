

# Fix Earn Credits Modal: Mobile Positioning + Remove Toast

## Problem
1. On mobile (390px), the dialog sits at `top: 5%` which pushes it too high — should be vertically centered
2. The `toast.success('Caption copied!')` is unnecessary for a simple copy action — the check icon swap is sufficient feedback

## Changes

### `src/components/app/EarnCreditsModal.tsx`

1. **Remove toast on copy** — delete the `toast.success('Caption copied!')` line and remove the `toast`/`sonner` import
2. **Fix mobile centering** — override the dialog's default `top-[5%]` positioning by adding classes to vertically center on mobile: `top-[50%] translate-y-[-50%] sm:top-[50%] sm:translate-y-[-50%]`

The DialogContent className becomes:
```tsx
className="sm:max-w-[440px] p-0 gap-0 border-border/50 bg-card overflow-hidden rounded-2xl mx-3 sm:mx-0 top-[50%] translate-y-[-50%]"
```

### Files
- `src/components/app/EarnCreditsModal.tsx` — 2 small edits

