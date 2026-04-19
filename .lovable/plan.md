

## Real root causes (re-checked the actual code)

### Issue 1 — Horizontal scrollbar (still there)
My previous fix added `overflow-x-hidden` to the **outer** wrappers in `AddProductModal.tsx` (lines 251, 286). But in **compact mode**, there's a **second nested scroll container** at line 114:

```tsx
const compactBody = (
  <div className="flex flex-col flex-1 min-h-0 min-w-0">
    <div className="flex-1 min-h-0 min-w-0 overflow-y-auto pr-1 -mr-1">  ← THIS one has no overflow-x-hidden
      {activeBody}
    </div>
```

The sticky footer's `-mx-7` overflows INSIDE this inner scroller, causing the horizontal scrollbar visible in the screenshot. The outer fix never reaches it.

### Issue 2 — "Thin line crashing design"
The `Product Details` section header (line 1106) has `border-b border-border/50` underneath it. Combined with the card's own outer border, this creates an awkward thin internal divider that visually splits the card — exactly what the user is complaining about. It's design noise.

## Fix (2 small edits)

### Fix A — Add `overflow-x-hidden` to the inner compact scroller
`src/components/app/AddProductModal.tsx` line 114: add `overflow-x-hidden` to the inner scroll wrapper inside `compactBody`. This contains the sticky footer's negative-margin bleed properly.

### Fix B — Remove the awkward border-b from the Product Details header
`src/components/app/ManualProductTab.tsx` line 1106: drop `border-b border-border/50` (and the `pb-1`) from the header row. Keep just the uppercase label + analyzing badge — clean, no internal divider. The card's outer border is enough visual containment.

Same treatment should apply to the `More Details` collapsible trigger (line 1218) when open — it also has `border-b border-border/50`. Remove it for consistency.

## Files to edit

- `src/components/app/AddProductModal.tsx` — add `overflow-x-hidden` to the inner compact scroller (line 114).
- `src/components/app/ManualProductTab.tsx` — remove `border-b border-border/50` from Product Details header (line 1106) and from More Details trigger (line 1218).

## Result

- No more horizontal scrollbar inside the modal in compact mode.
- Product Details card looks clean — single outer border, no internal hairline split.
- "More Details" expanded state matches the same clean look.

