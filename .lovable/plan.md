## Goal
On `/ai-product-photography/swimwear`:
1. Remove the "What we cover in swimwear" chips section (Bikinis / One-Pieces / Swim Shorts / Cover-Ups / Resort Wear).
2. Refresh the "One swimsuit · Every shot" grid (`BUILT_FOR_GRIDS.swimwear`) so each chip group shows real, current scene library images instead of stale/missing ones.

No backend, RLS, schema, edge function, or data-model changes. Pure frontend edits to two files.

## Changes

### 1. Hide subcategory chips for swimwear
**File:** `src/pages/seo/AIProductPhotographyCategory.tsx`

Extend the existing conditional that already hides chips for `home-furniture`:
```tsx
{!['home-furniture', 'swimwear'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
```
The `subcategories` array stays in the data file (used elsewhere for SEO copy). No other section is affected.

### 2. Refresh swimwear Built-For grid images
**File:** `src/data/aiProductPhotographyBuiltForGrids.ts` (swimwear block)

Replace stale `imageId`s with live IDs verified against `product_image_scenes`:

| Group | Old (stale) | New (live in scene library) |
|---|---|---|
| Resort Editorial | `1776246335378-kw9z8c` Yacht Deck | `1777996843133-j8fyxu` |
| Aesthetic Color | `1776246306554-a1y4nz` | `1777996990945-7t4iqw` |
| Aesthetic Color | `1776246296252-lf70sc` | `1777996986914-n16g2p` |
| Aesthetic Color | `1776246299612-uidzat` | `1777996989794-75995p` |
| Aesthetic Color | `1776246298538-xb12wj` | `1777996988655-w0z9fg` |
| Aesthetic Color | `1776246297359-aecrip` | `1777996987704-clgu3v` |
| Beach UGC | `1776522793804-125kin` | `1777996837190-gozhuc` |
| Beach UGC | `1776522770907-dwn2ay` | `1777996831843-l3w3d6` |
| Beach UGC | `1776522832053-f1h9ck` | `1777996839874-rwutl7` |
| Beach UGC | `1776246326918-ofopok` | `1777996836335-qaub4x` |

**Essential Shots** drops from 7 → 5 cards (keep: Ghost Mannequin, On-Model Front, On-Model Back, On-Model Editorial, Movement Shot). Remove `Texture Detail` and `Product + Packaging` — they do not exist in the live library for swimwear.

`PREVIEW(id)` constructs `…/scene-previews/{id}.jpg` which matches the live `preview_image_url` filenames, so the swap is sufficient — images render immediately.

## Safety
- Only two frontend files touched.
- No DB writes, no migrations, no edge function deploys.
- Admin `seo_page_visuals` has zero override rows for swimwear `builtFor_*` slots, so defaults render through.
- `home-furniture` chip-hide behavior is preserved exactly.
- Other categories (`apparel`, `eyewear`, etc.) are untouched.

## Rollback
Revert the two files — no state to clean up.

Approve to implement.