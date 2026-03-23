

# Move Progress Counter to Bottom + Reduce Top Spacing

## Changes

### `src/components/app/OnboardingChecklist.tsx`

**1. Remove top progress text** (line 78-80): Delete the `{completedCount} of {steps.length} complete` paragraph from the top.

**2. Reduce top padding** (line 77): Change `p-6` to `px-6 pt-3 pb-5` — less whitespace at top.

**3. Add progress counter at the bottom** after the steps list (after line 155):
```tsx
<p className="text-xs text-muted-foreground pt-4 border-t border-border mt-1">
  {completedCount} of {steps.length} complete
</p>
```

### File
- `src/components/app/OnboardingChecklist.tsx` — move counter to bottom, tighten top padding

