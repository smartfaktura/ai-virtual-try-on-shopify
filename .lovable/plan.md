

# Catalog Studio Hub Page — `/app/catalog`

## Overview

Create a new landing page at `/app/catalog` that shows past catalog generations and a prominent "New Generation" CTA. The current wizard/generate flow moves to `/app/catalog/new`. This gives users an easy way to track past catalog runs before starting a new one.

## Architecture

```text
/app/catalog          →  CatalogHub.tsx (NEW — history + new CTA)
/app/catalog/new      →  CatalogGenerate.tsx (existing wizard, renamed route)
```

## What gets built

### 1. New page: `src/pages/CatalogHub.tsx`

**Header section:**
- PageHeader "Catalog Studio" with subtitle
- Primary CTA button: "New Photoshoot" → navigates to `/app/catalog/new`

**Recent Generations section:**
- Query `generation_jobs` where `workflow_slug = 'catalog-studio'`, ordered by `created_at desc`, limit 50
- Group results into "sessions" by proximity (jobs created within 30s of each other = one session) — similar to `batchGrouping.ts` logic
- Each session card shows:
  - Thumbnail grid (first 4 images from `results` JSON)
  - Product name(s) involved
  - Image count, date/time, status summary
  - Click → opens a detail view or navigates to library filtered by those images

**Empty state:**
- Branded empty card: "No catalog shoots yet" with illustration and CTA to start first shoot

**Active generation banner:**
- If there's an active catalog session in `sessionStorage` (`catalog_batch`), show a "Generation in progress" banner at top that links to `/app/catalog/new` to resume

### 2. Route changes in `src/App.tsx`

- Add route: `/catalog` → `CatalogHub` (lazy loaded)
- Change existing: `/catalog/new` → `CatalogGenerate` (existing page)

### 3. Navigation update in `src/components/app/AppShell.tsx`

- Update sidebar link for Catalog Studio to point to `/app/catalog` instead of the wizard directly
- Add prefetch entry for the new hub page

### 4. Update `CatalogGenerate.tsx`

- "New Set" and back buttons navigate to `/app/catalog` (hub) instead of resetting in-place
- Add a back arrow in the PageHeader linking to `/app/catalog`

### 5. Session card design (VOVV.AI branded)

Each past session card:
- Rounded-2xl card with subtle border
- 2×2 thumbnail grid (aspect-[3/4], rounded-lg, object-cover) from the session's result images
- Right side: product names as pills, "8 images · Apr 2, 2026" metadata, status badge (completed/partial)
- Hover: subtle lift + ring effect
- Click: opens lightbox or navigates to library with those images

## Data flow

```text
CatalogHub
  └─ useQuery(['catalog-sessions'])
       └─ supabase.from('generation_jobs')
            .select('id, results, created_at, product_name, status, scene_name')
            .eq('workflow_slug', 'catalog-studio')
            .order('created_at', { descending: true })
            .limit(200)
       └─ Group by time proximity → session objects
       └─ Extract image URLs from results JSON
```

## Files to create/modify

| File | Action |
|------|--------|
| `src/pages/CatalogHub.tsx` | **Create** — new hub page |
| `src/App.tsx` | **Modify** — add `/catalog` route, move existing to `/catalog/new` |
| `src/components/app/AppShell.tsx` | **Modify** — update sidebar nav + prefetch |
| `src/pages/CatalogGenerate.tsx` | **Modify** — add back link to hub, update "New Set" navigation |

## Technical notes

- `generation_jobs.results` is JSON — contains array of image URLs. Parse with `(results as string[])` pattern already used in `useLibraryItems.ts`
- Session grouping: sort by `created_at`, group jobs within 30s window sharing same user — reuse pattern from `batchGrouping.ts`
- No new database tables needed — all data already exists in `generation_jobs`

