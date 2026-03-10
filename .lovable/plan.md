

## Improve Batch Mode: Smaller Previews + Full Details Per Product

The batch cards currently show oversized `aspect-square` images and only have title + type fields — missing description, dimensions, and quick-type chips that exist in single-product mode.

### Changes — `src/components/app/ManualProductTab.tsx`

**1. Shrink batch card images**
- Change from `aspect-square` to a compact horizontal layout: small thumbnail (80px) on the left, fields on the right
- This mirrors common batch/list UIs and fits more products on screen

**2. Add all fields to each batch card**
- Description textarea (2 rows, compact)
- Dimensions input (optional)
- Quick-type chips row per card
- All with the same AI shimmer/auto-fill behavior already wired up

**3. Update `BatchItem` interface**
- Add `dimensions: string` field

**4. Update `handleSubmitBatch`**
- Include `dimensions` in the insert payload

### Batch Card Layout (per product)

```text
┌─────────────────────────────────────────────┐
│ [80px thumb] │ Name *          [×]          │
│              │ Type ___  [chip] [chip] ...  │
│              │ Description ___              │
│              │ Dimensions ___ (optional)    │
└─────────────────────────────────────────────┘
```

### Grid
- Stack vertically (1 column) instead of the current 2-3 column grid, since each card now has more detail
- Keeps it scannable and consistent with the single-product form experience

