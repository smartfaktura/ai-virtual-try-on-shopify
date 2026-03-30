

## Fix: Estimate Line Shows "0 images" During Batch Preparation

### Problem

When `totalImages` is 0 (jobs not yet enqueued), the header correctly shows "Preparing batch…" but the estimate line below the progress bar still renders `Est. ~1 sec for 0 images`. The subtitle text (e.g., "16 images") from the parent already tells users the expected count — the estimate line just needs to hide until jobs exist.

### Fix

**File: `src/components/app/MultiProductProgressBanner.tsx`**

1. **Hide the estimate text when `totalImages === 0`**: Replace the estimate `<span>` with "Preparing…" or hide it entirely when no jobs are enqueued yet
2. **Use `totalExpectedImages` fallback from subtitle**: When `totalImages` is 0 but the parent knows the expected count (from the subtitle "16 images"), pass it as a prop so estimates are accurate from the start

Concrete change on **line 123**: wrap the estimate span so it only shows when `totalImages > 0`:

```tsx
<span>
  {totalImages > 0
    ? `Est. ~${estLow === estHigh ? estLow : `${estLow}-${estHigh}`} ${estUnit} for ${totalImages} image${totalImages !== 1 ? 's' : ''}`
    : 'Calculating estimate…'}
</span>
```

| File | Change |
|------|--------|
| `src/components/app/MultiProductProgressBanner.tsx` | Show "Calculating estimate…" instead of "Est. ~1 sec for 0 images" when totalImages is 0 |

