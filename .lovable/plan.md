

# Catalog Studio — Full UX Redesign

## Rename
"Catalog Shot Set" → **"Catalog Studio"** across all headings, subtitles, and the "How it works" banner.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CatalogGenerate.tsx` | Rename title, redesign stepper, remove filter state, update model step props, add more shots to engine, fix credit calc display with model multiplier |
| `src/components/app/catalog/CatalogStepProducts.tsx` | Add source tabs (Product Library / Import URL / Upload File), download template link, cleaner card layout |
| `src/components/app/catalog/CatalogStepFashionStyle.tsx` | Larger cards with more breathing room, cleaner copy, remove technical badges (poseEnergy etc.) |
| `src/components/app/catalog/CatalogStepModelsV2.tsx` | Remove ModelFilterBar, simpler grid with multi-select, show selection count badge, no gender/body/age filters |
| `src/components/app/catalog/CatalogStepShots.tsx` | Show credit formula breakdown with model count, add more shot variety |
| `src/lib/catalogEngine.ts` | Add ~8 new shot definitions (lifestyle, over-shoulder, waist-up, layered look, arm-extended, cross-body, wrist-shot, on-surface) |

## Detailed Changes

### 1. Stepper Redesign (`CatalogGenerate.tsx`)
- Replace pill-based breadcrumb with a clean horizontal numbered stepper with connecting lines
- Each step: number circle + label below, active = primary fill, done = checkmark, future = muted outline
- More visual weight and spacing between steps

### 2. Products Step — Source Tabs
- Add 3 tabs at the top: **"My Products"** (current grid) | **"Import from URL"** (paste website link) | **"Upload CSV"** (file upload + download template)
- "My Products" tab = existing product grid (unchanged logic)
- "Import from URL" = simple input + "Import" button (calls existing `import-product` edge function)
- "Upload CSV" = drag-and-drop zone + "Download Template" button (CSV with columns: title, image_url, product_type)
- Keep existing grid/list toggle, search, select all/clear for "My Products" tab

### 3. Fashion Style Cards
- Increase card size — `lg:grid-cols-3` instead of `lg:grid-cols-5` so they're roomier
- Remove technical badges (poseEnergy, accessoryIntensity) — these are internal engine values
- Keep just: bold label + 2-line description
- Add a subtle style-representative color accent or icon per style

### 4. Model Selection — Simplify
- Remove `ModelFilterBar` entirely (no gender/body/age dropdowns)
- Keep "No Model — Product Only" toggle card at top
- Show all library models in a clean grid (keep existing `ModelSelectorCard`)
- Multi-select with count badge: "3 models selected — each multiplies your shot count"
- Remove filter state from `CatalogGenerate.tsx` (genderFilter, bodyTypeFilter, ageFilter)

### 5. More Shots
Add to `SHOT_DEFINITIONS` in `catalogEngine.ts`:
- **Lifestyle Context** (on-model) — relaxed lifestyle pose with natural environment feel
- **Over Shoulder** (on-model) — viewed from behind over shoulder
- **Waist-Up Crop** (on-model) — cropped at waist for upper-body focus
- **Walking Motion** (on-model) — natural stride, full body
- **Cross-Body** (on-model, bag) — cross-body bag carry style
- **Wrist Shot** (on-model, jewelry) — close-up of wrist/hand with jewelry
- **On Surface** (product-only) — product placed on textured surface
- **Styled Flat Lay** (product-only) — product with minimal props arrangement

### 6. Credit Calculation Display
In the Shots step summary, show the full formula:
- `{products} products × {models} models × {shots} shots × 4 credits = {total} credits`
- When models = 0 (product only), show: `{products} products × {shots} shots × 4 credits = {total} credits`

## Technical Notes
- Remove `genderFilter`, `bodyTypeFilter`, `ageFilter` state and all `ModelFilterBar` references from `CatalogGenerate.tsx`
- Remove `ModelFilterBar` import from `CatalogStepModelsV2.tsx`
- `CatalogStepModelsV2` props simplified: drop filter-related props
- New shot IDs added to `CatalogShotId` union type in `src/types/catalog.ts`
- Product import tabs are UI-only for now (URL import calls existing edge function, CSV is a new client-side parser)

