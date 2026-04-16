

# Fix Survey Feedback Card Spacing in Freestyle

## Problem
The `ContextualFeedbackCard` on `/app/freestyle` sits too close to the prompt bar, has no horizontal padding on mobile, and doesn't align with the prompt bar edges on desktop.

## Fix

### `src/pages/Freestyle.tsx` — Lines 1148-1160

Change the wrapper div from absolute positioning to a normal flow `mb-3` div so it naturally creates a gap above the prompt bar. Add mobile horizontal padding (`px-3 sm:px-0`) so the card is inset on small screens but flush with the prompt bar on desktop.

**Before:**
```tsx
<div className="absolute -top-14 left-0 right-0 px-2 z-10">
  <ContextualFeedbackCard ... />
</div>
```

**After:**
```tsx
<div className="mb-3 px-3 sm:px-0">
  <ContextualFeedbackCard ... />
</div>
```

This gives:
- **Desktop**: card matches prompt bar width (no extra padding)
- **Mobile**: `px-3` insets it from screen edges
- **Gap**: `mb-3` creates consistent spacing between card and prompt bar

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Change feedback card wrapper from absolute to flow layout with responsive padding |

