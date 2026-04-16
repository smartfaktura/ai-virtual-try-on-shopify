

## Goal
Restructure trust text in `UpgradePlanModal` into a left-aligned, grouped block placed between plan selection and CTA buttons.

## File
`src/components/app/UpgradePlanModal.tsx`

## Current state
Two separate centered lines:
- "Cancel anytime · No commitment" (centered, after plan list)
- Lock icon + "You'll be securely redirected..." (centered, before footer buttons)

## Changes

Merge both lines into a single left-aligned `trust_block` container placed directly above the footer CTA buttons (inside the same horizontal padding as the buttons, so left edge aligns).

```tsx
<div className="px-6 sm:px-8 mt-4 sm:mt-5 mb-4 sm:mb-5 flex flex-col gap-1.5">
  <p className="text-[13px] text-muted-foreground">
    Cancel anytime · No commitment
  </p>
  <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
    <Lock className="w-3 h-3" />
    <span>You'll be securely redirected to complete checkout</span>
  </p>
</div>
```

### Removals
- Remove the existing centered "Cancel anytime · No commitment" line below plan selection
- Remove the existing centered lock + redirect line above the footer

### Hierarchy
- Line 1: `text-[13px]`, `text-muted-foreground` (primary support)
- Line 2: `text-xs` (12px), `text-muted-foreground/80` (softer), with lock icon

### Spacing
- `mt-4 sm:mt-5` (16–20px from plans)
- `gap-1.5` (6px between lines)
- `mb-4 sm:mb-5` (16–20px before buttons)

### Layout
- Uses `px-6 sm:px-8` to align left edge with plan cards and CTA buttons
- Applied to **both** `upgrade` and `topup` variants (shared trust block)

## Out of scope
- No other modal logic, copy, or button changes

