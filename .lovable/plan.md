

# E-Commerce Style Thumbnail Strip for Multi-Image Workflow Cards

## What Changes
When a workflow job has more than 1 image, the card will show a **main hero thumbnail** plus a row of **small mini-thumbnails** below it (like product image galleries on Shopify/Amazon). Clicking any mini-thumbnail opens the modal at that specific image index.

## UI Layout per Card (multi-image jobs only)

```text
┌──────────────────┐
│                  │
│   Main Image     │  ← First image, large
│   (hero)         │
│                  │
├──┬──┬──┬──┬──────┤
│t1│t2│t3│t4│ +1   │  ← Mini thumbnails row (max 4 shown, "+N" overflow)
└──┴──┴──┴──┴──────┘
  Product Listing Set
  5 minutes ago
```

- Single-image jobs: unchanged (current square card, no thumbnail strip)
- Multi-image jobs: main image is the first result; below it, a row of tiny square thumbnails (max 4 visible, with a "+N" pill if more exist)
- Clicking any mini-thumbnail opens the modal at that image's index
- Clicking the main image opens the modal at index 0

## File Changes

### `src/components/app/WorkflowRecentRow.tsx`

1. **Pass all signed URLs** to `ThumbnailCard` (not just the first) — add `allSignedUrls: string[]` prop
2. **ThumbnailCard** — when `allSignedUrls.length > 1`:
   - Remove the "5 imgs" badge
   - Below the main image div, render a flex row of mini-thumbnails (28×28px squares, rounded, border, `object-cover`)
   - Show max 4 thumbnails; if more, show a small "+N" pill
   - Each mini-thumb is clickable → calls `onSelect` with the clicked index
3. **Update `onSelect`** callback to accept an optional `startIndex` parameter so clicking a specific mini-thumbnail opens the modal at that image
4. Card width stays the same; the thumbnail strip fits within the existing card width

