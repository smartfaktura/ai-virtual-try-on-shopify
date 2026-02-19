

## Fix: Remove Duplicate Time Estimate in Generation Loading

### Problem
The QueuePositionIndicator shows two time references simultaneously:
- "Est. ~70-110 seconds" (dynamic estimate based on complexity)
- "Using Pro model for best quality -- ~60-120s per image" (static Pro model hint)

This is redundant and visually cluttered.

### Solution
Remove the time portion from the Pro model hint since the dynamic estimate already accounts for Pro model complexity. Change the hint text to just: **"Using Pro model for best quality"** -- no time range.

### File to Change

| File | Change |
|------|--------|
| `src/components/app/QueuePositionIndicator.tsx` | Update `getProModelHint()` (line 42) to return `'Using Pro model for best quality'` instead of including the `~60-120s per image` suffix |

This keeps the useful context ("Pro model") without duplicating time information that the dynamic estimate already covers.

