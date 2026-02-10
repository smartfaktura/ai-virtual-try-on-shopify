

## Remove "Scenes" Category, Elevate Modal Design, Improve "More Like This"

### 1. Remove "Scenes" as a Separate Category

Scenes are just a special type of content (usable as a scene in Freestyle), not a category. They should appear in ALL category views mixed with presets.

**Changes to `src/pages/Discover.tsx`:**
- Remove `{ id: 'scenes', label: 'Scenes' }` from the CATEGORIES array
- Update the filter logic: instead of hiding scenes when a category is selected (`if (item.type === 'scene') return false`), map scene categories to the filter categories. Scene categories are `studio`, `lifestyle`, `editorial`, `streetwear` -- map them so e.g. `lifestyle` scenes appear when the "Lifestyle" filter is active, `editorial` scenes show under "Cinematic" or a relevant match
- Scenes still keep their "Scene" badge on cards so users know they can be used as scenes in Freestyle

**Category mapping for scenes:**
- `studio` scenes -> show in "Commercial", "Photography" filters
- `lifestyle` scenes -> show in "Lifestyle" filter
- `editorial` scenes -> show in "Cinematic", "Photography" filters
- `streetwear` scenes -> show in "Styling", "Lifestyle" filters
- All scenes always visible under "All"

### 2. Elevate the Detail Modal to Premium Design

The current modal is flat and boring. Redesign it with depth, glass effects, and better visual hierarchy.

**Changes to `src/components/app/DiscoverDetailModal.tsx`:**

- Image area: add subtle inner shadow overlay at bottom for depth, slightly larger max-height
- Title section: larger text (`text-2xl`), letter-spacing, with the category as a subtle uppercase label ABOVE the title (not a badge below)
- Generate Prompt button: glass/frosted style with `backdrop-blur` and subtle gradient border, icon with shimmer effect
- Generated prompt display: darker card with subtle glow border when present
- Primary CTA: gradient background or subtle shadow lift, larger size
- Secondary actions (Save, Similar, Copy): icon-prominent with frosted glass pill style, arranged as a tight row of icon buttons with labels
- Description text: lighter weight, more refined typography
- Tags: smaller, more subtle, inline with description
- "More like this" section: larger thumbnails (grid-cols-3 instead of 4), rounded-xl with hover scale, subtle shadow

**New visual flow:**
```text
+--------------------------------------------+
|  [Image -- large, subtle bottom shadow]    |
+--------------------------------------------+
|  LIFESTYLE  (tiny uppercase label)         |
|  Garden Natural  (large elegant title)     |
|  Scene badge if applicable                 |
|                                            |
|  [--- Generate Prompt --- frosted glass]   |
|  [generated prompt card if available]      |
|  [Copy]  [Use in Freestyle]               |
|                                            |
|  Description text (refined, no box)        |
|  #tags inline                              |
|                                            |
|  [========= Use Scene =========]  (big)   |
|                                            |
|  [heart Save] [search Similar] [copy Copy] |
|                                            |
|  --- More like this ---                    |
|  [  thumb  ] [  thumb  ] [  thumb  ]       |
+--------------------------------------------+
```

### 3. Improve "More Like This" Similarity

Currently it only matches by exact category, which gives poor results (e.g., all lifestyle items look "related" even if they're completely different visually).

**Better matching algorithm in `src/pages/Discover.tsx`:**

Instead of just category matching, implement a scoring system:

- **Same category**: +2 points
- **Shared tags** (preset-to-preset): +1 point per shared tag
- **Same type** (both scenes or both presets): +1 point
- **Scene category overlap** (scene `lifestyle` matches preset category `lifestyle`): +2 points
- Sort by score descending, take top 6 (increase from 4)
- Exclude exact same item

This means a "Garden Natural" lifestyle scene will show other lifestyle scenes AND lifestyle presets, ranked by how many attributes overlap. Much better than random same-category items.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Discover.tsx` | Remove "Scenes" category, update filter logic for scene category mapping, improve relatedItems scoring algorithm, increase related count to 6 |
| `src/components/app/DiscoverDetailModal.tsx` | Premium glass-effect redesign with better visual hierarchy, reordered sections, larger related thumbnails |

No new files. No database changes.

