

## Fix Discover Clicks + Add Save and Search Similar

### Problem 1: Click Not Opening Detail View

The current code works like this:
- Clicking a **preset** (non-scene) card sets `selectedPreset` state which opens the detail modal -- this should work
- Clicking a **scene** card navigates directly to Freestyle -- no detail view shown

The likely issue is that **scene cards don't open any detail view** -- they just navigate away. Since most visible cards in the screenshot are scenes (marked with "Scene" badge), clicking them redirects to Freestyle instead of showing information.

**Fix**: Make ALL cards open a unified detail view first. For scenes, show the scene image, name, description, and a "Use Scene" button. For presets, show the existing prompt/copy/use flow. This gives every card a consistent click behavior.

### Problem 2: Add "Save" Feature

Create a `saved_discover_items` database table so users can bookmark presets and scenes they like (similar to the Pinterest "Save" button in the reference screenshot).

### Problem 3: Add "Search Similar" Feature

Implement a tag-and-category-based similarity system. When a user clicks "Search Similar" on any item, filter the Discover feed to show items that share the same category and overlapping tags. This is a practical first version that doesn't require ML/computer vision.

---

### Changes

#### 1. Database: New `saved_discover_items` table

```text
saved_discover_items
- id (uuid, PK)
- user_id (uuid, NOT NULL) -- references auth user
- item_type (text) -- 'preset' or 'scene'  
- item_id (text) -- preset UUID or scene poseId
- created_at (timestamptz)
- UNIQUE(user_id, item_type, item_id)
```

RLS: Users can only read/insert/delete their own saved items.

#### 2. Unified Detail Modal for Both Presets and Scenes

Refactor `DiscoverDetailModal` to accept a `DiscoverItem` (preset or scene) instead of only a preset. For scenes, show:
- Large scene preview image
- Scene name and description
- Category badge
- "Use Scene" button (navigates to Freestyle with scene param)
- "Save" / "Search Similar" buttons

For presets, keep existing behavior plus add Save and Search Similar.

#### 3. Save Button on Cards and Modal

- Add a heart/bookmark icon overlay on every card (bottom-right corner)
- Clicking it saves/unsaves the item
- Add a "Saved" category filter tab to show only saved items
- Save state managed via a `useSavedItems` hook

#### 4. Search Similar Feature

When clicking "Search Similar" on any item:
- For presets: filter by same category + matching tags
- For scenes: filter by same scene category (studio, lifestyle, editorial, streetwear)
- Apply the filter as a search state, showing a "Similar to: [name]" chip that can be cleared

This is tag/category-based matching -- simple but effective. No ML needed.

### Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Create `saved_discover_items` table with RLS |
| `src/hooks/useSavedItems.ts` | New -- save/unsave/check saved status |
| `src/components/app/DiscoverCard.tsx` | Add save button overlay, update click to always open detail |
| `src/components/app/DiscoverDetailModal.tsx` | Support both presets and scenes, add Save + Search Similar buttons |
| `src/pages/Discover.tsx` | Add "Saved" filter tab, handle "similar" filtering state, pass unified item to modal |

### Technical Details

- The detail modal receives a `DiscoverItem` union type instead of just `DiscoverPreset`
- Save uses optimistic UI updates via React Query mutation + cache invalidation
- "Search Similar" sets a `similarTo` state in Discover.tsx that filters by category match + tag overlap, with a dismissible chip showing the source item name
- Scene detail view shows the scene's `description`, `category`, and preview image from `mockTryOnPoses`
- The "Saved" tab queries `saved_discover_items` for the current user and cross-references with presets and scenes

