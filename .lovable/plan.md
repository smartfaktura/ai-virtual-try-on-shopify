

# Fix "NEW" Badge Readability in Dark Mode

## Problem
The "NEW" badge next to feature items (e.g., "Brand Models") uses `bg-primary/15 text-primary border-0`. In dark mode, `--primary` is a muted blue-grey (`210 17% 70%`), making the text nearly invisible against the low-opacity background.

## Fix
Update the badge classes in both files to use higher-contrast styling that works in both light and dark modes:

### Files to change:
1. **`src/components/landing/LandingPricing.tsx`** (line ~137)
2. **`src/components/app/PlanCard.tsx`** (line ~114)

### Change
Replace:
```
bg-primary/15 text-primary border-0
```
With:
```
bg-primary/20 text-primary-foreground dark:bg-primary/30 dark:text-primary-foreground border border-primary/30
```

Actually simpler — use the default Badge variant which already has good contrast (`bg-primary text-primary-foreground`), but scale it down:

```
bg-primary text-primary-foreground text-[9px] px-1.5 py-0 leading-tight
```

This gives a solid, readable badge in both themes — matching the "CURRENT" badge style visible in the screenshot.

