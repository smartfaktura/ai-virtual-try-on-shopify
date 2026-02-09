

## Filter Scenes for Virtual Try-On & Display as Grid (Not Scroll)

### Problem
1. **Wrong scenes shown**: Virtual Try-On shows product-only categories (Clean Studio, Surface & Texture, Flat Lay, Kitchen, Living Space, Bathroom, Botanical) that make no sense for on-model try-on -- these are for product photography, not fashion.
2. **Horizontal scroll layout**: Scenes are displayed as horizontal scroll strips per category, making it hard to browse. They should be a full grid.
3. **Limited scene variety**: Only 4 on-model categories exist (Studio, Lifestyle, Editorial, Streetwear). More variety would help.

---

### 1. Filter to On-Model Categories Only (for Try-On)

In `src/pages/Generate.tsx`, filter `posesByCategory` to only include categories relevant to virtual try-on:

**On-model categories to keep**: `studio`, `lifestyle`, `editorial`, `streetwear`

**Product categories to hide**: `clean-studio`, `surface`, `flat-lay`, `kitchen`, `living-space`, `bathroom`, `botanical`

The filtering will check if the active workflow is Virtual Try-On and exclude non-model categories.

---

### 2. Change Layout from Horizontal Scroll to Grid

In `src/components/app/PoseCategorySection.tsx`, replace the horizontal `ScrollArea` with a responsive grid:

- Current: `<ScrollArea>` with `flex` row of fixed-width cards
- New: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3` showing all scenes at once
- Remove the `flex-shrink-0` and fixed widths so cards fill the grid naturally

---

### 3. Add More On-Model Scenes

Add new scene entries to `src/data/mockData.ts` using existing asset images. New scenes to add:

| Name | Category | Description | Asset |
|---|---|---|---|
| Gym & Fitness | lifestyle | Athletic setting with gym equipment | existing lifestyle assets |
| Shopping District | streetwear | Busy shopping area with store fronts | existing streetwear assets |
| Resort Poolside | lifestyle | Luxury resort pool area with warm light | existing lifestyle assets |
| Art Gallery | editorial | White gallery space with art installations | existing editorial assets |
| Autumn Park | lifestyle | Fall foliage with warm golden tones | existing lifestyle assets |
| Warehouse Loft | editorial | Raw industrial loft with large windows | existing editorial assets |

We'll reuse existing pose asset images that haven't been assigned yet to avoid needing new image files.

---

### Technical Details

| File | Change |
|---|---|
| `src/pages/Generate.tsx` (~line 255) | Filter `posesByCategory` to only on-model categories when in Virtual Try-On workflow |
| `src/components/app/PoseCategorySection.tsx` | Replace horizontal `ScrollArea` with `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4` layout |
| `src/data/mockData.ts` (~line 1670) | Add ~6 new on-model scene entries reusing existing assets |

No database changes or new dependencies needed.
