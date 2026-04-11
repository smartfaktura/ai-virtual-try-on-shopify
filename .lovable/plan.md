

# Fix Library Item Naming Structure

## Problem
The library detail modal shows inconsistent, generic labels like "Generation" for the category and the workflow name as the heading. There's no clear mapping from the source workflow to a meaningful category label. The `workflowSlug` field is available on items but never used for display.

**Current behavior** (from your screenshot):
- Small label: "Generation"
- Heading: "Product Visuals"
- No product name visible

**Expected**: Clear category + meaningful heading per workflow type.

## Changes

### 1. `src/hooks/useLibraryItems.ts` — Improve label structure in `jobsToRawItems`

Change the label construction (line 66) to use a ` — ` separator format when both workflow name and product title exist:
```
label = workflowName && productTitle
  ? `${workflowName} — ${productTitle}`
  : workflowName || productTitle || 'Generated';
```

This ensures the detail modal can split the label into category + heading.

### 2. `src/components/app/LibraryDetailModal.tsx` — Use `workflowSlug` for category mapping

Replace the fragile ` — ` split logic (lines 200-203) with a proper mapping function:

| `workflowSlug` | Small label |
|---|---|
| `product-images` | `PRODUCT VISUALS` |
| `virtual-try-on-set` / `virtual-tryon` | `VIRTUAL TRY-ON` |
| `catalog-studio` | `CATALOG STUDIO` |
| `text-to-product` | `TEXT TO PRODUCT` |
| Any other slug | Slug formatted as title |
| No slug + source `freestyle` | `FREESTYLE` |
| No slug + source `generation` | `GENERATION` |

For the **heading**:
- If product name exists → use product name
- Else if model + scene names → "Model · Scene"
- Else if label has ` — ` → use part after separator
- Else → use full label

This uses the already-available `workflowSlug`, `productName`, `modelName`, `sceneName` fields on `LibraryItem` — no new data needed.

### 3. `src/components/app/LibraryImageCard.tsx` — No changes needed
The card itself doesn't display the label prominently, so no work here.

## Result
Every library item will show a clean, recognizable category (e.g., "PRODUCT VISUALS", "FREESTYLE", "VIRTUAL TRY-ON") with the product/model name as the heading underneath.

