

## Problem Analysis

Two issues found in `src/data/mockData.ts`:

### 1. Duplicate preview images (the bug)

Six poses (pose_025 through pose_030) reuse the same `previewUrl` as earlier poses because no unique female preview images exist for them. They only have unique male variants. This causes visible duplicates in the scene grid:

| Pose | Name | Reuses image from |
|------|------|-------------------|
| pose_025 | Gym & Fitness | pose_017 (Rooftop City) |
| pose_026 | Shopping District | pose_010 (Urban Stairs) |
| pose_027 | Resort Poolside | pose_015 (Beach Sunset) |
| pose_028 | Art Gallery | pose_009 (Editorial Minimal) |
| pose_029 | Autumn Park | pose_016 (Park Bench) |
| pose_030 | Warehouse Loft | pose_018 (Editorial Window) |

**Fix:** Generate 6 unique female preview images for these poses using the AI image generation edge function (`generate-scene-previews`), upload them to the `landing-assets` storage bucket under `poses/`, and update the `previewUrl` references in `mockData.ts`.

### 2. More product environment scenes needed

Currently only 18 product scenes (scene_001 to scene_018). Will add ~12 more high-demand scenes across categories most commonly used by e-commerce brands:

**New scenes to add:**
- **Clean Studio:** Shadow Play (hard directional shadow), Color Backdrop (solid bold color)
- **Surface:** Linen Textile, Terrazzo Surface  
- **Kitchen:** Modern Brunch Table, Wine & Cheese Board
- **Living Space:** Mid-Century Console, Window Sill
- **Bathroom:** Spa Towels, Glass Shelf
- **Botanical:** Tropical Leaves, Dried Flowers
- **New category — Outdoor:** Beach Sand, Stone Path

### Implementation

**File: `src/data/mockData.ts`**

1. Add 6 new unique female preview image URL variables for the duplicate poses (e.g., `pose-lifestyle-gym.jpg`, `pose-streetwear-shopping.jpg`, etc.)
2. Update pose_025–030 to reference these new unique URLs
3. Add ~12–14 new scene entries (scene_019 through scene_032) with descriptive promptHints and preview images sourced from existing landing-assets or new ones
4. For new scene preview images, reuse existing showcase/template images where appropriate (different scenes can share a general aesthetic image), and for truly new scenes, reference new storage paths

**File: `src/types/index.ts`** — Add 'outdoor' to the `PoseCategory` type if not already present

**File: `src/components/app/PoseCategorySection.tsx`** — Add 'outdoor' category info to `categoryInfo` map

**File: `src/data/mockData.ts`** — Add 'outdoor' label to `poseCategoryLabels`

