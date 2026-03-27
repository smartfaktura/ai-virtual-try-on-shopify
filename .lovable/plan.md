

# Discover Cards: Add Product Chip to Hover + Secure Preview Pipeline

## Summary
- On **hover cards only**: replace the workflow/generation-type label with a product chip (when product data exists). Keep workflow info intact in detail/preview modals.
- Create a secure product preview pipeline so private product images are never exposed publicly.
- Add privacy controls to the Publish to Discover modal.
- Add admin product selector in the detail modal.

## Architecture: Secure Product Preview

```text
Private product image (user's bucket)
       │
       ▼  [at publish time]
Edge function: generate-discover-preview
       │  Downloads via service role
       │  Resizes to 240×240 .webp, strips EXIF
       └─ Uploads to public bucket: discover-previews/{postId}/{random}.webp
       │
       ▼
discover_presets.product_image_url = public preview URL
```

## Changes

### 1. SQL Migration — Create `discover-previews` public storage bucket
Create a public bucket for sanitized product preview assets.

### 2. New Edge Function: `generate-discover-preview/index.ts`
- Accepts `{ sourceUrl, postId }`
- Downloads image via service role
- Resizes to 240×240 compressed .webp, strips metadata
- Uploads to `discover-previews/{postId}/{nanoid}.webp`
- Returns the public URL

### 3. `src/components/app/DiscoverCard.tsx` — Hover overlay changes
- Add `productThumb` and `productName` from `item.data.product_image_url` / `item.data.product_name`
- In the hover overlay's thumbnail list (lines 87-101), add a product row below model (same style: 7×7 thumbnail + name)
- **Remove the generation type badge** (lines 122-127 — the `genLabel` showing workflow name) from the hover overlay only
- The `getGenerationLabel` function stays — it may be used elsewhere

### 4. `src/components/app/AddToDiscoverModal.tsx` — Privacy controls + preview generation
Add a toggles section before the Publish button:
- "Show model name" (Switch, default on)
- "Show scene name" (Switch, default on)
- "Show product used" (Switch, default off — only visible when `productName` exists)
- When product toggle is on and `productImageUrl` exists: call `generate-discover-preview` to create sanitized preview, use returned URL as `product_image_url`
- When toggles are off: null out the corresponding fields in the preset data
- **Keep `workflow_name`** in the saved data (it stays in detail modals)

### 5. `src/components/app/DiscoverDetailModal.tsx` — Admin product editor
- In the admin metadata editor grid, add a text input for product name and product image URL
- When admin saves with a new product image URL, call `generate-discover-preview` to create a safe preview
- The existing "Created with" section already renders product data — no changes needed there
- **Workflow info stays as-is in the detail modal**

### 6. `src/components/app/PublicDiscoverDetailModal.tsx`
- Already shows product_name/product_image_url in "Created with" section — no changes needed

## What does NOT change
- Detail/preview modals keep showing workflow name, scene, model, product — everything stays
- "Recreate this" continues to pass workflow/settings but not the original product source
- The `getGenerationLabel` function is preserved

