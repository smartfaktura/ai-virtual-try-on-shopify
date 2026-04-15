

# Fix Library Download Filenames to Match Generate Results Page

## Problem
When downloading from the Library (`/app/library`), filenames look like:
`street_walk_—_charcoal_ribbed_crew-a1b2c3d4.jpg`

But from the Generate results page, filenames look like:
`charcoal_ribbed_crew-street_walk-model_front-1.jpg`

The library uses `item.label` (which is "Workflow — Product") while Generate uses a structured `buildFileName` that sanitizes and orders parts as product → workflow → model → index.

## What Changes

### 1. Create a shared `buildLibraryFileName` utility in `src/lib/downloadFileName.ts`
Extract a reusable filename builder that takes a `LibraryItem` and produces the same naming pattern as the Generate page:
- Sanitize and join: `{productName}-{sceneName/workflowSlug}-{modelName}-{shortId}.ext`
- Falls back gracefully when fields are missing

### 2. Update `LibraryImageCard.tsx` (line 221)
Replace `${item.label}-${item.id.slice(0, 8)}.png` with the shared builder.

### 3. Update `LibraryDetailModal.tsx` (line 95)
Replace `${activeItem.label.replace(/\s+/g, '-').toLowerCase()}-${activeItem.id.slice(0, 8)}` with the shared builder.

## Filename Format (matching Generate page)
```text
{product_name}-{scene_or_workflow}-{model_name}-{short_id}.ext
```
Example: `charcoal_ribbed_crew-street_walk-model_front-a1b2c3.jpg`

## Files Modified
- **New**: `src/lib/downloadFileName.ts`
- **Edit**: `src/components/app/LibraryImageCard.tsx`
- **Edit**: `src/components/app/LibraryDetailModal.tsx`

