

# Add "Out of Credits" CTA to Dashboard

## What Changes

Add a prominent inline card right below the welcome text on both the **new user** and **returning user** dashboards when `isEmpty` is true (0 credits). The card follows the user's exact wording from their reference images:

- **Title**: "You're out of credits"
- **Subtitle**: "Get credits to start creating."
- **CTA button**: "Get Credits" (opens the buy modal)

## Design

A subtle card with a Sparkles icon, similar in style to the existing credit badge on the new user dashboard but more prominent when empty. Rounded-xl, light primary tint background, sits between the welcome header and the main content.

## Technical Changes

### `src/pages/Dashboard.tsx`

**New user dashboard (line ~318-324)**: Replace the simple credit badge with a conditional — when `isEmpty`, show the CTA card; otherwise show the existing credit count badge.

**Returning user dashboard (line ~548)**: The `LowCreditsBanner` already exists here but uses different copy. Add the same out-of-credits card above it (or replace the banner when empty) so the CTA is consistent.

Specifically:
1. Destructure `isEmpty` and `openBuyModal` from `useCredits()` (already imported)
2. In both dashboard modes, insert:
```tsx
{isEmpty && (
  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <Sparkles className="w-5 h-5 text-primary shrink-0" />
      <div>
        <p className="font-semibold text-sm">You're out of credits</p>
        <p className="text-sm text-muted-foreground">Get credits to start creating.</p>
      </div>
    </div>
    <Button onClick={openBuyModal} className="rounded-full font-semibold shrink-0">
      Get Credits
    </Button>
  </div>
)}
```

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add out-of-credits CTA card to both new and returning dashboard views |

