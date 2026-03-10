

## Improve Batch Upload UX: Clearer Messaging + Collapsible Categories

Two issues from the screenshots:

### 1. Upload zone doesn't clearly communicate batch behavior
The hint "drop multiple for batch add (up to 10)" is buried in tiny text. Users don't understand each image = separate product.

**Fix**: Update the upload zone copy to be more explicit:
- Main text: "Drop images, **browse**, or paste"  
- Sub-text: "Each image creates a separate product · up to 10 at once"
- Add a small `Layers` icon or similar to hint at multi-product

### 2. Quick-type chips are noisy when category is already filled
When AI fills in a specific type like "Oversized Hoodie", showing all 11 generic chips clutters the UI. The chips are only useful when the type field is empty or the user wants a generic category.

**Fix for single mode**: Hide chips when `productType` is already filled (AI or manual). Show a small "Browse categories" link/button that expands them on click, or use a `Select` dropdown.

**Fix for batch mode**: Same — hide chips per card when `productType` is filled. Show a small clickable text like "Change category" that reveals the chips row. This dramatically reduces card height and clutter.

### Changes — `src/components/app/ManualProductTab.tsx`

1. **Upload zone text** (line ~679-683): Change copy to emphasize each image = separate product
2. **Single mode chips** (lines 787-800): Wrap in a collapsible section — show chips only when `productType` is empty OR user clicks "Change category" toggle
3. **Batch mode chips** (lines 566-579): Same collapsible pattern per card — hidden when type is filled, revealed via toggle
4. **Add per-batch-item state**: Track `showChips: boolean` in component state (not in BatchItem, just local toggle map)

### UI Result

**Upload zone:**
```
        Drop images, browse, or paste
  Each image creates a separate product · up to 10 at once
```

**Batch card with type filled (collapsed — default):**
```
[thumb] | Name: Dark Grey Hoodie    Type: Hoodie  [×]
        | ▸ Change category
        | Description...           Dimensions...
```

**Batch card with type empty or expanded:**
```
[thumb] | Name: ___                 Type: ___     [×]
        | Clothing  Footwear  Beauty  Skincare ...
        | Description...           Dimensions...
```

