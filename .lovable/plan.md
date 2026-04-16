

# Replace Header with Engaging Headline + Subheadline

## Problem
The current header shows "0 credits remaining" and utility text — not engaging or brand-aligned. The credit balance is irrelevant context for the subscription decision.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx` (lines 132-160)

**Replace the entire header block** with a clean headline + subheadline, no border-b separator:

- Remove: `{balance} credits remaining`, `Choose a plan to keep creating`, `Scale faster with...`
- Remove: `border-b border-border/40` from the header div
- Keep: close button, renewal info for paid users

New header content:
```
Unlock your visual potential
Pick a plan that fits your creative ambitions
```

- Headline: `text-xl font-bold tracking-tight`
- Subheadline: `text-sm text-muted-foreground mt-1`
- No separator line between header and content

### File: `src/components/app/NoCreditsModal.tsx` (line 77-79)

Replace the subtitle with the same subheadline:
```
Pick a plan that fits your creative ambitions
```

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Replace credit-balance header with engaging headline + subheadline, remove separator |
| `NoCreditsModal.tsx` | Update subtitle text to match |

