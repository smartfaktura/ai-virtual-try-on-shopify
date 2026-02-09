

## Redesign Library Page + Include Freestyle Generations + Dashboard Recent Creations

### Current Problems

1. **Library uses mock data** -- The entire Jobs.tsx page reads from `mockJobs` (hardcoded mock data), not from the actual `generation_jobs` or `freestyle_generations` database tables
2. **No freestyle images** -- Freestyle generations are completely absent from both the Library and Dashboard
3. **Table-only layout** -- A plain data table is not ideal for an image library; users want to see their creations visually
4. **Title says "Jobs"** -- Should reflect "Library" since that's the sidebar label

### Redesigned Library Page

The Library will become a **visual gallery** with two tabs and optional filters:

```text
+--------------------------------------------------+
|  Library                                          |
|  Your generated images and freestyle creations    |
|                                                   |
|  [All]  [Generations]  [Freestyle]     [Grid/List]|
|                                                   |
|  Search...          Status v      Sort: Newest v  |
|                                                   |
|  +-------+  +-------+  +-------+  +-------+      |
|  |       |  |       |  |       |  |       |      |
|  | img   |  | img   |  | img   |  | img   |      |
|  |       |  |       |  |       |  |       |      |
|  +-------+  +-------+  +-------+  +-------+      |
|  Product    Freestyle   Product    Freestyle       |
|  Oct 15     Oct 14      Oct 13     Oct 12         |
+--------------------------------------------------+
```

**Gallery view (default)**: Masonry-style grid of image cards with hover overlays showing prompt/product info, download button, and delete for freestyle images.

**List view (toggle)**: Compact table similar to current design but pulling real data.

### Data Sources

| Tab | Database Table | Key Fields |
|---|---|---|
| Generations | `generation_jobs` | results (image URLs), product, workflow, status, credits |
| Freestyle | `freestyle_generations` | image_url, prompt, aspect_ratio, quality, model/scene/product IDs |

Both are merged into a unified `LibraryItem` type sorted by `created_at` for the "All" tab.

### Dashboard: Recent Creations Update

Update `RecentCreationsGallery.tsx` to also query `freestyle_generations` and merge results with generation job images, sorted by date. This gives the dashboard a complete view of all user creations.

### Files to Change

1. **`src/pages/Jobs.tsx`** -- Complete rewrite: rename to Library, replace mock data with real DB queries (generation_jobs + freestyle_generations), add gallery grid view with image cards, keep list view as toggle, add tabs for All/Generations/Freestyle
2. **`src/components/app/RecentCreationsGallery.tsx`** -- Add a second query for `freestyle_generations`, merge with generation job results, sort by date
3. **`src/components/app/LibraryImageCard.tsx`** (new) -- Reusable card component for gallery view showing image thumbnail, hover overlay with details, download/delete actions
4. **`src/types/index.ts`** -- Add `LibraryItem` union type for unified display

### Key Design Decisions

- Gallery grid uses `columns-2 md:columns-3 lg:columns-4` masonry layout for visual variety
- Each card shows: image, source badge (Workflow name or "Freestyle"), date, and hover actions
- Freestyle images get a delete button; generation job images do not (jobs cannot be deleted per RLS)
- Status filters only apply to the Generations tab (freestyle images are always "completed")
- The "All" tab interleaves both sources sorted by creation date
- Maintains the luxury minimalist aesthetic with rounded-2xl cards, subtle borders, and hover transitions

