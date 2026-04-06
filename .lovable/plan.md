

# Swap Sub-Group Layout: Label Left, Select All Right

## Change

In `SubGroupSection` (lines 425-436 of `ProductImagesStep2Scenes.tsx`), swap the order so:

```text
ESSENTIAL SHOTS  ─────────────────────  [Select All (3/5)]
[scene] [scene] [scene] [scene]
```

1. Move the `<p>` label (uppercase sub-category name) to the **left**
2. Keep the divider line in the middle
3. Move the `<Button>` (Select All / Deselect) to the **right**

## File

**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** — lines 425-436: reorder the three children inside the flex row.

