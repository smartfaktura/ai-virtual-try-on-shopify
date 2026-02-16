

## Fix Creative Drops Loading State (Flipping Screen)

### Root Cause

The Creative Drops page has no loading guard before rendering. When the page loads:

1. Queries start with `schedulesLoading = true` and `dropsLoading = true`
2. But `hasStats` is evaluated as `schedules.length > 0 || drops.length > 0` which uses the default empty arrays, so it evaluates to `false`
3. The onboarding screen flashes briefly
4. Then if cached/stale data exists (React Query cache), `hasStats` flips to `true` and shows the stats ribbon
5. Then fresh data arrives (empty), `hasStats` flips back to `false`, showing onboarding again

This creates a visible "flip" between states.

### Fix

**File: `src/pages/CreativeDrops.tsx`** (around line 216-226)

Add a loading guard before the `hasStats` conditional. While either query is still loading (and we're not in the wizard), show a lightweight skeleton instead of immediately choosing between onboarding and stats views.

```tsx
// Before the hasStats conditional (line ~222-226), add:
{wizardOpen ? (
  <CreativeDropWizard ... />
) : (schedulesLoading || dropsLoading) ? (
  // Gentle loading skeleton - no jarring flicker
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
    <div className="h-10 w-64 rounded-xl bg-muted/50 animate-pulse" />
    <div className="space-y-3">
      <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
      <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
    </div>
  </div>
) : !hasStats ? (
  <CreativeDropsOnboarding ... />
) : (
  // existing stats + tabs UI
)}
```

This ensures the page waits for data before deciding which view to show, eliminating the flip entirely. The skeleton is subtle (low opacity, fade-in) so it doesn't draw attention.

### Summary

- **1 file modified**: `src/pages/CreativeDrops.tsx`
- Single change: add loading skeleton guard before the onboarding vs stats conditional
- No database changes needed (drops are already deleted)
- Prevents the flipping/flashing between onboarding and stats views during data load
