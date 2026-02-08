
# Expand Scene Library with Category Filters

## What's Changing

The Scene selector currently has 24 scenes, ALL focused on fashion/model poses (Studio, Lifestyle, Editorial, Streetwear). This doesn't serve users who photograph skincare, food, or home products. We'll add product-focused scene environments and introduce filter tabs so users can quickly find what they need.

## New Scene Categories

Currently there are 4 categories, all people-focused. We'll add 4 new product-environment categories:

| Filter Tab | Sub-categories included | Purpose |
|---|---|---|
| **All** | Everything | Default view |
| **On-Model** | Studio, Lifestyle, Editorial, Streetwear | Existing 24 fashion scenes |
| **Product** | Clean Studio, Surface/Texture, Flat Lay | General product photography |
| **Food & Home** | Kitchen/Dining, Living Space | Category-specific environments |
| **Beauty** | Bathroom/Vanity, Botanical | Skincare & wellness settings |

## New Scenes to Add (~18 new scenes)

**Clean Studio (3 scenes)** -- using template assets
- White Seamless, Gradient Backdrop, Minimalist Platform

**Surface & Texture (3 scenes)** -- using showcase assets
- Marble Surface, Wooden Table, Concrete Slab

**Flat Lay (2 scenes)** -- using template assets
- Overhead Clean, Styled Flat Lay

**Kitchen & Dining (3 scenes)** -- using food showcase assets
- Rustic Kitchen, Bright Countertop, Cafe Table

**Living Space (3 scenes)** -- using home showcase assets
- Japandi Shelf, Cozy Evening, Morning Bedroom

**Bathroom & Vanity (2 scenes)** -- using skincare showcase assets
- Marble Vanity, Bright Bathroom

**Botanical (2 scenes)** -- using showcase assets
- Garden Setting, Botanical Arrangement

## UI Changes to SceneSelectorChip

- Replace "No Scene" text with a conditional "Clear selection" button (only shown when a scene is active)
- Add an X button on the chip itself for quick deselect (matching Model and Product selectors)
- Add horizontal filter tabs at the top: **All | On-Model | Product | Food & Home | Beauty**
- Move scene names below images instead of overlaying them (matching the Product/Model selector pattern)
- Slightly wider popover (w-96 instead of w-80) for better browsing

## Technical Details

### Files Modified

**`src/types/index.ts`**
- Expand `PoseCategory` union type to include new categories:
  `'studio' | 'lifestyle' | 'editorial' | 'streetwear' | 'clean-studio' | 'surface' | 'flat-lay' | 'kitchen' | 'living-space' | 'bathroom' | 'botanical'`

**`src/data/mockData.ts`**
- Add ~18 new imports from `src/assets/showcase/` and `src/assets/templates/` to use as scene preview images
- Add ~18 new entries to `mockTryOnPoses` array with the new categories
- Expand `poseCategoryLabels` with labels for all new categories

**`src/components/app/freestyle/SceneSelectorChip.tsx`**
- Add a `sceneFilter` state with tabs: All, On-Model, Product, Food & Home, Beauty
- Define a mapping from each filter tab to which `PoseCategory` values it includes
- Filter the displayed categories based on the active tab
- Move scene names below images (matching Product/Model pattern)
- Replace "No Scene" with conditional "Clear selection"
- Add X button on the chip for quick deselect
- Widen the popover from w-80 to w-96
