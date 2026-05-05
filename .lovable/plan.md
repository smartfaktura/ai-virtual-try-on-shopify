## Overview

Two changes:
1. Split the existing `hats-small` category (45 scenes) into three new standalone categories: **Caps**, **Hats**, **Beanies**
2. Dissolve the "Bags & Accessories" admin group — each category becomes standalone

## Database changes

- **Rename** all 45 `hats-small` rows to `caps`
- **Duplicate** those 45 rows twice — once as `hats`, once as `beanies` (new UUIDs, same scene content)

## Code changes (~18 files)

### Admin page (`AdminProductImageScenes.tsx`)
- Remove the "Bags & Accessories" group from `CATEGORY_GROUPS`
- Add standalone entries: Bags, Backpacks, Wallets & Cardholders, Belts, Scarves, Caps, Hats, Beanies
- Remove `hats-small` entry

### Scene taxonomy (`sceneTaxonomy.ts`)
- Add `caps`, `hats`, `beanies` to `CATEGORY_FAMILY_MAP` (mapped to "Accessories" or kept standalone)
- Update `SUB_FAMILY_LABEL_OVERRIDES` — remove `hats-small`, add caps/hats/beanies
- Update `ONBOARDING_TO_COLLECTIONS_MAP` — replace `hats-small` with `caps`, `hats`, `beanies` in the accessories array
- Update `bags-accessories` collection map to remove `hats-small`

### Types (`types/index.ts`, `product-images/types.ts`)
- Replace `hats-small` with `caps | hats | beanies` in ProductCategory unions

### Prompt builder (`productImagePromptBuilder.ts`)
- Add `case 'caps':`, `case 'hats':`, `case 'beanies':` alongside existing `case 'hats-small':` entries (7 switch cases)

### Outfit conflict resolver (`outfitConflictResolver.ts`)
- Expand `hats-small` check to include `caps`, `hats`, `beanies`

### Product spec fields (`productSpecFields.ts`)
- Add `caps`, `hats`, `beanies` field definitions (copy from `hats-small`)
- Add to `CATEGORY_LABELS`

### Category utils (`categoryUtils.ts`)
- Replace `hats-small` mapping with entries for caps/hats/beanies

### Onboarding taxonomy (`onboardingTaxonomy.ts`)
- Replace `hats-small` with `caps`, `hats`, `beanies`

### Scene selection UI (`ProductImagesStep2Scenes.tsx`)
- Update `CATEGORY_LABELS`, `CATEGORY_ORDER`, keyword map, and tab groups
- Dissolve the single "Bags & Accessories" tab into individual category tabs

### Step 3 Refine (`ProductImagesStep3Refine.tsx`)
- Replace `hats-small` entries with caps/hats/beanies in CATEGORY_DETAIL_HINTS and CATEGORY_PROMPT_HINTS
- Update the fallback map

### Other files (minor find-and-replace)
- `sceneData.ts`, `visualLibraryDeepLink.ts`, `usePublicSceneLibrary.ts`, `useProductImageScenes.ts`, `demoProducts.ts`, `AdminBulkPreviewUpload.tsx`, `AddToDiscoverModal.tsx`, `DashboardDiscoverSection.tsx`
