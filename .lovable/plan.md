

## Fix: Close Button Overlapping "FREE" Badge

### Problem
The dialog's built-in close (X) button overlaps the plan badge ("FREE") in the modal header because both sit at the top-right corner. The badge has no right margin to account for the close button.

### Solution
Add right padding to the header's badge area so it doesn't collide with the close button. The DialogContent close button is typically positioned at `right-4 top-4`, so the badge needs enough margin-right (approximately `mr-8`) to clear it.

### Change (single file: `src/components/app/BuyCreditsModal.tsx`)

**Line 86** - Add `mr-8` to the Badge so it sits to the left of the X button:

```tsx
// Before
<Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1">

// After
<Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1 mr-8">
```

This gives the close button its own space without touching the plan label.
