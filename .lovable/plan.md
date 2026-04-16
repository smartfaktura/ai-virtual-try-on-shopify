

# Add Price-Per-Credit to Plan Cards in BuyCreditsModal

## Problem
The main pricing popup (BuyCreditsModal, Plans tab) shows monthly price and credits count but doesn't show the per-credit cost. This metric helps users see the value increase with higher plans and encourages upgrades.

## Calculated Values
- **Free**: 20 credits → N/A (free)
- **Starter**: 500 credits / $39 = **7.8¢** per credit
- **Growth**: 1,500 credits / $79 = **5.3¢** per credit
- **Pro**: 4,500 credits / $179 = **4.0¢** per credit

## Fix

### `src/components/app/BuyCreditsModal.tsx` — Lines 369-379

Add a price-per-credit line below the credits count in the "Image estimate" section of each plan card. Compute it dynamically: `(displayPrice / credits * 100).toFixed(1)` cents per credit. Skip for the Free plan.

**Before:**
```tsx
<div className="mb-4">
  {imageEstimate ? (
    <>
      <p className="text-sm font-medium text-foreground">~{imageEstimate} images/mo</p>
      <p className="text-[11px] text-muted-foreground">{credits.toLocaleString()} credits/mo</p>
    </>
  ) : (
    <p className="text-sm text-muted-foreground">{p.credits} credits</p>
  )}
</div>
```

**After:**
```tsx
<div className="mb-4">
  {imageEstimate ? (
    <>
      <p className="text-sm font-medium text-foreground">~{imageEstimate} images/mo</p>
      <p className="text-[11px] text-muted-foreground">{credits.toLocaleString()} credits/mo</p>
      {displayPrice > 0 && (
        <p className="text-[10px] text-primary font-medium mt-0.5">
          {(displayPrice / credits * 100).toFixed(1)}¢ per credit
        </p>
      )}
    </>
  ) : (
    <p className="text-sm text-muted-foreground">{p.credits} credits</p>
  )}
</div>
```

| File | Change |
|------|--------|
| `src/components/app/BuyCreditsModal.tsx` | Add computed ¢-per-credit line under credits count for paid plans |

