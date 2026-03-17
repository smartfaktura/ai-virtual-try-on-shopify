

## Changes to Flat Lay Set Workflow

### 1. Change subtitle text from "1–5" to "1–3"

**File: `src/pages/Generate.tsx` ~line 2172**

Change:
```
'Select 1–5 products to arrange together in your flat lay composition'
```
To:
```
'Select 1–3 products to arrange together in your flat lay composition'
```

### 2. Show all selected flat lay products in the generating loading state

Currently (line 3537-3542), only one product image is shown as a single avatar. For flat lay with multiple selected products, show all of them side-by-side.

**File: `src/pages/Generate.tsx` ~line 3520-3548**

Add a new condition before the single-product fallback: when `isFlatLay && selectedFlatLayProductIds.size > 1`, render a row of overlapping circular thumbnails for all selected products (using `userProducts` filtered by `selectedFlatLayProductIds`). Each product gets a small rounded avatar, slightly overlapping the previous one (negative margin), all with the pulse animation. This replaces the single product image display during generation.

