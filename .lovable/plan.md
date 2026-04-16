

# Show Credit Banner in Freestyle — Matching Image Grid Width

## Problem
The global `LowCreditsBanner` is excluded from Freestyle. The user wants a credit banner inside Freestyle that matches the width of the image grid (uses `px-3 lg:px-1` padding), not the smaller global banner styling.

## Fix

### `src/pages/Freestyle.tsx` — Add banner inside the `px-3 lg:px-1 space-y-2` div (line 978)

Insert the banner right at the top of the content area, before the `recreateSource` alert. It uses the same container padding as the grid so edges align perfectly:

```tsx
{balance < 4 && (
  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <Sparkles className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="font-semibold text-sm">
          {balance === 0 ? "You're out of credits" : "Running low on credits"}
        </p>
        <p className="text-sm text-muted-foreground hidden sm:block">
          {balance === 0
            ? "Top up to keep creating with VOVV.AI"
            : `Only ${balance} credits left — top up to avoid interruptions`}
        </p>
      </div>
    </div>
    <Button onClick={openBuyModal} size="sm" className="rounded-lg font-semibold shrink-0">
      Get Credits
    </Button>
  </div>
)}
```

This sits inside the same `px-3 lg:px-1` container as the image grid, so it spans edge-to-edge with the images. Same visual style as the original banner — not larger, just properly wide.

### Imports
Add `Button` import if not already present (it is already imported in Freestyle).

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Add inline credit banner inside the content area at line ~979 |

