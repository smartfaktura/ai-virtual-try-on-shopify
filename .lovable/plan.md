

## Change

Center the "You'll be securely redirected to complete checkout" line (with lock icon) so it visually matches the centered "Cancel anytime · No commitment" line above it.

## File

`src/components/app/UpgradePlanModal.tsx`

Currently (around line 326):
```tsx
<div className="px-6 sm:px-8 pb-5 pt-0 flex items-center gap-1.5 text-xs text-muted-foreground">
  <Lock className="w-3 h-3" />
  <span>You'll be securely redirected to complete checkout</span>
</div>
```

Change to add `justify-center`:
```tsx
<div className="px-6 sm:px-8 pb-5 pt-0 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
  <Lock className="w-3 h-3" />
  <span>You'll be securely redirected to complete checkout</span>
</div>
```

## Result

Both reassurance lines (Cancel anytime + secure redirect) are centered and visually aligned, applied to both upgrade and topup variants since they share this footer block.

