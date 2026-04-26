## Admin SEO Page Visuals — Version 1

A safe, simple admin tool to swap images on the 16 public SEO landing pages, sourced from the same curated `product_image_scenes` catalog already used by Step 2 of `/app/generate/product-images` and `/product-visual-library`. Public pages keep their current static images as fallbacks; overrides are layered on top only when explicitly configured.

### Discoveries

- **All 16 SEO pages already exist** and render static images via the `PREVIEW(imageId)` helper exported from `src/data/aiProductPhotographyCategoryPages.ts`. `imageId` is a stable string token referenced by the `product_image_scenes` table (column: `scene_id` or matching preview slug).
- **Single source of truth** for the curated visual library is the Supabase table `public.product_image_scenes` (active rows). Both Step 2 (`useProductImageScenes`) and `/product-visual-library` (`usePublicSceneLibrary`) read from this table and use `preview_image_url` + `getOptimizedUrl(...)` for thumbnails. We will reuse `usePublicSceneLibrary` for the picker — it already filters to active rows, public-safe columns, and supports family/collection/sub-category grouping.
- **Admin pattern** is established: `useIsAdmin()` → `if (!isRealAdmin) return <Navigate to="/app" replace />`, route registered under `/app/admin/*` in `src/App.tsx`, and a link added to the AppShell user menu. We follow it exactly.
- **Existing image flow** to preserve: every SEO image source uses one of two patterns — `PREVIEW(imageId)` returning a Supabase Storage URL, then wrapped in `getOptimizedUrl(url, { quality: 60 })`. We keep this path intact for fallbacks.

### Architecture

**Override-only model.** The SEO page code does not change in terms of what images it knows about. We add a thin override layer:

1. New table `seo_page_visuals` keyed by `(page_route, slot_key)`.
2. New helper `useSeoVisualOverrides(pageRoute)` — fetches all overrides for a route as a `Map<slot_key, {scene_id, preview_image_url, alt}>`. Cached 5 min, public-readable.
3. New helper `resolveSlotImage(pageRoute, slotKey, fallbackImageId)` — used by SEO components to return the override `scene_id`/URL if present, else the existing static `imageId`. Defaults are unchanged.
4. Each SEO image render site is wrapped to call `resolveSlotImage`. If override fetch fails or returns nothing, fallback path is identical to today.

**Static slot registry** (`src/data/seoPageVisualSlots.ts`) defines every editable slot per page with: `slotKey`, `slotLabel`, `sectionName`, `whereItAppears`, `required`, `recommendedTags`, `recommendedAspectRatio`, `fallbackImageId`. The admin UI is driven entirely by this registry — admins never see raw column names. Slots are mapped only where each page actually renders an image (Hero collage tiles, Visual System rows, Scene Examples grid, Category Hero, Category Visual Outputs, Comparison Before/After, Final CTA).

### Database (single migration)

```sql
create table public.seo_page_visuals (
  id uuid primary key default gen_random_uuid(),
  page_route text not null,
  slot_key text not null,
  scene_id text not null,                 -- reference to product_image_scenes.scene_id
  preview_image_url text not null,        -- denormalized for fast public reads
  alt_text text,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_route, slot_key)
);

alter table public.seo_page_visuals enable row level security;

-- Public can read overrides (SEO pages render anonymously)
create policy "Anyone can read seo visual overrides"
  on public.seo_page_visuals for select to anon, authenticated using (true);

-- Only admins can write
create policy "Admins manage seo visual overrides"
  on public.seo_page_visuals for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

create index seo_page_visuals_route_idx on public.seo_page_visuals (page_route);
```

`scene_id` is stored as the stable text reference (matches `product_image_scenes.scene_id`). `preview_image_url` is denormalized to keep public reads to a single round-trip.

### Files added

- `src/data/seoPageVisualSlots.ts` — static slot registry for all 16 pages with human-friendly labels and recommended tags.
- `src/hooks/useSeoVisualOverrides.ts` — read overrides for a page route (cached, public).
- `src/hooks/useAdminSeoVisuals.ts` — admin-only CRUD (upsert/delete by `page_route + slot_key`, batch save).
- `src/lib/resolveSlotImage.ts` — pure helper used by SEO components.
- `src/pages/admin/SeoPageVisuals.tsx` — the admin page.
- `src/components/admin/seo-visuals/PageList.tsx` — left sidebar (grouped by Main / Category / Tool / Comparison) with status badges per page (configured / using fallbacks / unsaved).
- `src/components/admin/seo-visuals/SlotGrid.tsx` — center panel: slot cards grouped by `sectionName`, each card shows current thumbnail (override or fallback), label, where-it-appears blurb, status badge, "Change image" button.
- `src/components/admin/seo-visuals/SlotDetailsPanel.tsx` — right panel: slot info + open-live-page button.
- `src/components/admin/seo-visuals/ScenePickerModal.tsx` — image picker. Reuses `usePublicSceneLibrary()` so the modal grid is identical in feel to `/product-visual-library`. Includes search, family filter, "Recommended for this slot" toggle (default on, filters by `recommendedTags` against scene `category_collection`/`sub_category`), uses `getOptimizedUrl(..., { quality: 55 })` thumbnails only, lazy-loaded grid with virtualized chunks.
- `src/components/admin/seo-visuals/UnsavedBar.tsx` — sticky bottom bar with Save/Discard.

### Files touched (minimal, surgical)

- `src/App.tsx` — add lazy route `/admin/seo-page-visuals`.
- `src/components/app/AppShell.tsx` — add admin menu link "SEO page visuals" (mirrors existing entries).
- **SEO image render sites** — wrap each `PREVIEW(imageId)` lookup with `resolveSlotImage(pageRoute, slotKey, fallbackImageId)`. No structural changes, no copy changes, no metadata changes. Affected components:
  - `src/components/seo/photography/PhotographyHero.tsx` (hero collage tiles)
  - `src/components/seo/photography/PhotographyVisualSystem.tsx` (visual system rows)
  - `src/components/seo/photography/PhotographySceneExamples.tsx` (scene grid)
  - `src/components/seo/photography/category/CategoryHero.tsx` (hero + collage)
  - `src/components/seo/photography/category/CategoryVisualOutputs.tsx`
  - `src/components/seo/photography/category/CategorySceneExamples.tsx`
  - `src/pages/seo/AIProductPhotoGenerator.tsx`, `ShopifyProductPhotography.tsx`, `EtsyProductPhotography.tsx`, `AIPhotographyVsPhotoshoot.tsx`, `AIPhotographyVsStudio.tsx` (inline image arrays)

Each touch is the same pattern: `PREVIEW(id)` → `PREVIEW(resolveSlotImage(route, slotKey, id))`. If overrides are unset or fetch fails, the function returns `id` unchanged → identical render.

### Slot registry shape

```ts
export const SEO_PAGE_VISUAL_SLOTS = {
  '/ai-product-photography': {
    label: 'AI Product Photography Hub',
    group: 'main',
    slots: [
      { key: 'heroTile1', section: 'Hero', label: 'Hero collage tile 1', required: true,
        whereItAppears: 'First tile in the hero collage above the fold.',
        recommendedTags: ['fashion','editorial','studio'], recommendedAspectRatio: '4:5',
        fallbackImageId: 'repeated-shadow-grid-fragrance-1776013389735' },
      // …all 12 hero tiles + 6 visual system tiles + 10 scene examples
    ],
  },
  '/ai-product-photography/fashion': { ... },   // pulls from CATEGORY_PAGES['fashion'].sceneExamples + heroCollage
  // …16 entries total
} as const;
```

Category pages are derived programmatically from `aiProductPhotographyCategoryPages.ts` (each already declares `heroCollage`, `sceneExamples`, etc. with `imageId`s — we simply project them into slot definitions so labels stay in sync if the category page data changes).

### Admin UX flow (Version 1)

1. Admin opens `/app/admin/seo-page-visuals`. Left sidebar lists 16 pages grouped by Main / Category / Tool / Comparison, each showing `X/Y configured` and a status dot (Complete / Using fallbacks / Unsaved).
2. Click a page → center fills with slot cards grouped by section (Hero / Visual System / Scene Examples / etc.). Each card shows current thumbnail (override if exists, else fallback), label, where-it-appears one-liner, required/optional badge.
3. Click "Change image" on a card → modal opens, titled "Select visual from Product Visuals library", with subtitle showing page + section + slot. Default filter = "Recommended for this slot" (filters scenes whose `category_collection` matches `recommendedTags`). Toggle off to browse all.
4. Click a tile in the modal → tile shows selected state. Click "Select image" → modal closes, slot card updates locally and is marked "Unsaved". Sticky bottom bar appears: "You have N unsaved changes — Save / Discard".
5. Save → batch upserts all dirty slots for the current page in one transaction. Toast on success/failure. On failure, dirty state preserved.
6. Switching pages with unsaved changes → confirm dialog. Discard → revert to last saved.
7. Right panel: when no slot selected, shows page overview (configured count, fallback count, open live page). When slot selected, shows slot label, section, where-it-appears, current alt text, recommended specs.

### Safety guarantees

- **Public pages never break**: the `resolveSlotImage` helper synchronously returns the fallback `imageId` if the override map is empty, missing, or the fetch is in flight. Override fetch is a non-blocking `useQuery` with `staleTime: 5min`; first paint always uses fallback, override hydrates if available.
- **No image render path uses raw user uploads** — picker is hard-wired to `usePublicSceneLibrary()` which only reads `product_image_scenes` (admin-curated, active rows).
- **No SEO regression**: copy, headings, JSON-LD, canonicals, OG images (still derived from `heroImageId`), routes, layouts, section order — all untouched.
- **Performance**: picker uses `getOptimizedUrl(url, { quality: 55 })` thumbnails only with `loading="lazy"`. Public pages use the same optimization helper they already use.
- **Auth**: `useIsAdmin` guard on the route; RLS enforces admin-only writes server-side.

### Out of scope (explicitly deferred)

- Iframe live preview, audit log, AI alt text generation, advanced filtering beyond family + recommended toggle, OG image override, admin permission tiers, bulk import/export, version history.

### Acceptance checklist

Mirrors the 27-point QA list — every public page renders identically when no overrides exist, admin can swap any registered slot, swap persists, and pages reflect the new image after refresh. Non-admins are redirected. No layout shift, no broken images, no SEO field changes.
