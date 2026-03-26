

# Fix: Over-Detailed Product Description Causing Label/Construction Hallucinations

## Problem
The prompt instructions tell the AI to replicate "all visible construction details", "stitching, and fabric weave", "material grain", "collar/neckline style, zipper/button placement, pockets" — this causes the model to literally render internal labels, seams, and construction minutiae that should be hidden when worn naturally (e.g., the inside brand label being visible on the jacket collar).

## Changes

All in `supabase/functions/generate-freestyle/index.ts`:

### 1. Soften product reference instructions (lines 190, 197)
Replace "shape, material, color, texture, and all visible construction details" with:
```
shape, color, and overall appearance
```
Keep the core identity matching without obsessing over construction.

### 2. Soften quality block (lines 240-241)
Replace:
```
"Sharp micro-detail on textures, stitching, and fabric weave."
"Visible material grain. Single cohesive photograph, edge-to-edge."
```
With:
```
"Sharp detail on textures and surfaces."
"Single cohesive photograph, edge-to-edge."
```

### 3. Soften Seedream product instruction (line 487)
Replace:
```
"Match precise shape, silhouette, color, material texture, collar/neckline style, zipper/button placement, pockets, and all visible construction details."
```
With:
```
"Match precise shape, silhouette, color, and overall appearance."
```

## Why This Helps
The AI takes these instructions literally — "all visible construction details" means it tries to show the inside label, exposed stitching, and exaggerated construction features. By focusing on overall appearance and silhouette, the product stays recognizable without hallucinated internal details.

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — 4 line edits

