

# Fix: Allow Reference Angle Uploads for Single-Image URL Imports

## Problem
When importing from a URL that returns only 1 image, the role-cycling gallery (Back/Side/Pack) is completely hidden because it requires `image_urls.length > 1`. Users have no way to add reference angles for these products.

## Solution
Add manual reference angle upload slots (identical to the ManualProductTab design) below the product preview when URL import detects only 1 image. When multiple images exist, keep the current click-to-cycle system but also show the upload slots for any unassigned roles.

## Changes

### `src/components/app/StoreImportTab.tsx`

**1. Add state for manually uploaded reference images**
Add 3 state variables for file uploads + their preview URLs (back, side, packaging), plus a small upload helper that stores to Supabase storage and returns the public URL.

**2. Add reference angle upload section after the product preview**
Below the existing image gallery (or below the single-image preview), add a section:
- Header: "Extra angles improve AI accuracy" (matching ManualProductTab style)
- 3 upload slots (88px each) for Back, Side, Packaging
- Each slot opens a file picker; once uploaded, shows thumbnail with remove button
- Only show slots for roles NOT already assigned via the click-to-cycle system

**3. Update `handleSave` to use manually uploaded URLs**
Merge the manually uploaded reference URLs with the cycle-assigned ones — manual uploads take priority when the cycle system hasn't assigned a role.

### Layout when only 1 image from URL:
```text
┌────────────────────────────────┐
│ 🖼 Product preview (80px)     │
│ Title, type, description       │
└────────────────────────────────┘

📐 Extra angles improve AI accuracy
┌──────────┐ ┌──────────┐ ┌──────────┐
│  ↺  +    │ │  →  +    │ │  📦  +   │
│ Back     │ │ Side     │ │ Packaging│
└──────────┘ └──────────┘ └──────────┘

              [Discard] [Save Product]
```

## Files
- `src/components/app/StoreImportTab.tsx` — ~60 lines added

## What stays the same
- Click-to-cycle for multi-image imports still works
- Import/save logic structure unchanged
- ManualProductTab unchanged

