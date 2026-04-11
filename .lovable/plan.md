

# Fix: resolveGarmentType Returns Wrong Candidate

## The Problem

`resolveGarmentType` returns the **first non-empty** value from the chain (`garmentType` → `productSubcategory` → `product_type` → `title`), but that value might not match any keyword in `getConflictingSlots`.

Example: A sweater product where:
- `garmentType` = undefined
- `productSubcategory` = "Knitwear" ← returned first, but "knitwear" doesn't match any keyword
- `product_type` = "Tops" ← never tried
- `title` = "Cashmere V-Neck Sweater" ← contains "sweater", would match, but never reached

Result: `getConflictingSlots("Knitwear")` → empty set → TOP slot stays open.

## The Fix

**File: `src/lib/productImagePromptBuilder.ts`** (~10 lines)

Change `resolveGarmentType` to try **all candidates** and return the first one that actually produces a non-empty conflict set. If none match, fall back to returning the first non-empty value (for display purposes).

```text
function resolveGarmentType(analysis, product):
  candidates = [garmentType, productSubcategory, product_type, title]
  
  // First pass: find a candidate that actually matches a slot
  for each candidate:
    if getConflictingSlots(candidate).size > 0 → return candidate
  
  // Second pass: return first non-empty (for display, even if no slot match)
  return first non-empty candidate
```

Also add common synonyms to `getConflictingSlots` that the AI might return as subcategories: `knitwear`, `outerwear`, `tops`, `bottoms`, `footwear`, `denim`.

## Files Changed

1. **`src/lib/productImagePromptBuilder.ts`** — rewrite `resolveGarmentType` to prefer conflict-matching candidates; add synonym keywords to `getConflictingSlots`

No other files need changes — the UI code in Step3Refine already calls these functions correctly.

