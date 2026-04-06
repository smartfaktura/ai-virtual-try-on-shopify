

# Admin Product Image Scenes Manager

## Context

Product Image scenes are currently **hardcoded** in `sceneData.ts` (~100 scenes across 14 global scenes + 11 category collections). The existing `/app/admin/scenes` page manages Freestyle/TryOn scenes only. There is no admin UI to manage Product Image scenes.

## Approach

Move Product Image scene definitions to a new database table so admins can add, edit, reorder, hide, and configure scenes without code changes. The frontend falls back to the hardcoded data as seed, then reads from the database going forward.

## Database

### New table: `product_image_scenes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `scene_id` | text UNIQUE | e.g. `clean-packshot`, `fragrance_hero_surface` |
| `title` | text | Display name |
| `description` | text | Short description for users |
| `prompt_template` | text | Full prompt with `{{tokens}}` |
| `trigger_blocks` | text[] | Which detail panels to show |
| `is_global` | boolean | True = universal scene |
| `category_collection` | text | e.g. `fragrance`, `shoes` (null if global) |
| `scene_type` | text | `macro`, `packshot`, `portrait`, `lifestyle`, `editorial`, `flatlay` |
| `exclude_categories` | text[] | Product categories to hide this scene from |
| `preview_image_url` | text | Optional preview thumbnail |
| `is_active` | boolean | Soft-delete / hide |
| `sort_order` | integer | Within its collection |
| `created_at` | timestamptz | |

RLS: Admin-only write, authenticated read.

### Seed migration

A second migration seeds all ~100 hardcoded scenes from `sceneData.ts` into the table so nothing is lost.

## New Page: `/app/admin/product-image-scenes`

### Layout (single scrollable page)

```text
┌──────────────────────────────────────────────────┐
│ Product Image Scene Manager          [+ Add Scene]│
│ [Search...]                    [Show hidden ☐]   │
├──────────────────────────────────────────────────┤
│ ▼ Global Scenes (14)                             │
│   ┌─────────────────────────────────────────┐    │
│   │ [≡] Clean Studio Shot    packshot  ✓    │    │
│   │     triggerBlocks: background, productSize   │
│   │     [Edit] [Hide] [↑] [↓]              │    │
│   └─────────────────────────────────────────┘    │
│   ...                                            │
│                                                  │
│ ▼ Fragrance (7 scenes)                           │
│   ┌─────────────────────────────────────────┐    │
│   │ [≡] Hero Bottle on Stone  editorial ✓   │    │
│   │     [Edit] [Hide] [↑] [↓]              │    │
│   └─────────────────────────────────────────┘    │
│   ...                                            │
│                                                  │
│ ▼ Beauty & Skincare (7 scenes)                   │
│   ...                                            │
└──────────────────────────────────────────────────┘
```

### Edit Panel (inline expand or modal)

When clicking "Edit" on a scene row, an inline collapsible expands with:

- **Title** — text input
- **Description** — text input
- **Scene Type** — select (macro/packshot/portrait/lifestyle/editorial/flatlay)
- **Category Collection** — select (global, fragrance, beauty-skincare, etc.)
- **Trigger Blocks** — multi-select checkboxes from the 11 known blocks
- **Exclude Categories** — multi-select checkboxes (product categories like home-decor, tech-devices)
- **Prompt Template** — large textarea with token reference guide
- **Preview Image** — upload or URL input
- **Active** — toggle switch
- **Sort Order** — number input

### Add New Scene

"+ Add Scene" button opens the same form but empty, with category collection pre-selected if adding from within a collection section.

### Features

- **Search** across all scenes by title/description/scene_id
- **Reorder** within collections (up/down arrows + save)
- **Hide/Show** toggle (sets `is_active = false`)
- **Prompt token reference** — collapsible guide showing all available `{{tokens}}`
- **Bulk save** — dirty tracking with single save button

## Code Changes

### New hook: `useProductImageScenes.ts`

- Fetches all scenes from `product_image_scenes` table
- Provides `GLOBAL_SCENES` and `CATEGORY_COLLECTIONS` shaped data
- Falls back to hardcoded `sceneData.ts` if table is empty (first-load safety)
- CRUD mutations for admin operations

### Update scene consumers

- `ProductImagesStep2Scenes.tsx` — import scenes from hook instead of hardcoded `sceneData.ts`
- `ProductImagesStep3Refine.tsx` — same
- `ProductImagesStep4Review.tsx` — same
- `productImagePromptBuilder.ts` — same
- Keep `sceneData.ts` as fallback/seed reference only

### Register route

- Add lazy import + route in `App.tsx` at `/app/admin/product-image-scenes`

## Files

| File | Action |
|---|---|
| Migration 1 | Create `product_image_scenes` table with RLS |
| Migration 2 | Seed all ~100 scenes from hardcoded data |
| `src/hooks/useProductImageScenes.ts` | New hook — fetch, CRUD, shaped output |
| `src/pages/AdminProductImageScenes.tsx` | New admin page |
| `src/App.tsx` | Add route |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Use hook instead of hardcoded imports |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Use hook |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Use hook |
| `src/lib/productImagePromptBuilder.ts` | Use hook-provided data |

