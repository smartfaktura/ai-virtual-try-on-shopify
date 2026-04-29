## Step 1 search input — soften focus state

**Cause:** The shared `Input` component (`src/components/ui/input.tsx` line 11) applies `focus-visible:ring-2 ring-ring ring-offset-2` on focus. On the Step 1 search box (`src/pages/ProductImages.tsx` line 1345), this thick dark ring + 2px offset reads like an error highlight and visually overflows around the rounded pill.

### Single change
Override the focus styles on this one Input to a subtle, design-system-aligned focus (no offset, thinner soft ring, gentle border tint).

`src/pages/ProductImages.tsx` line 1345:

```diff
- className="h-10 rounded-full text-sm pl-9"
+ className="h-10 rounded-full text-sm pl-9 focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0 focus-visible:border-ring/40"
```

This keeps a clear (but quiet) focus indicator, removes the heavy dark ring, and removes the 2px offset so the input no longer appears to overflow its container on focus.

### Files touched
- `src/pages/ProductImages.tsx` (1 line)