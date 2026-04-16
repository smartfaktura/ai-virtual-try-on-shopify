

# Show Feedback Card After Every Freestyle Generation

## Problem
The `ContextualFeedbackCard` on the Freestyle page only appears after the 3rd generation (`newCount === 3`). You want it shown after every successful generation.

## Fix

### `src/pages/Freestyle.tsx`

**1. Line 404** — Always show feedback when a generation completes, not just at count 3:
```tsx
// Before:
const [showFreestyleFeedback, setShowFreestyleFeedback] = useState(freestyleGenCountRef.current === 3);

// After:
const [showFreestyleFeedback, setShowFreestyleFeedback] = useState(false);
```

**2. Lines 788-791** — Remove the `=== 3` condition, always trigger feedback on completion:
```tsx
// Before:
if (newCount === 3) {
  setCompletedFeedbackJobId(activeJob.id);
  setShowFreestyleFeedback(true);
}

// After:
setCompletedFeedbackJobId(activeJob.id);
setShowFreestyleFeedback(true);
```

The generation counter tracking can stay (useful for analytics), but the feedback card will now appear after every successful generation.

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Remove count === 3 gate, show feedback after every generation |

