

# Slug-based Discover URLs

## Problem
Current URLs use raw UUIDs: `/discover/afca02b9-b5a1-4214-ace7-ca40511b0fa5`
Want readable slugs: `/discover/editorial-fashion-sunset-abc12`

## Approach
Add a `slug` column to `discover_presets` table, auto-generated from title + short UUID suffix. Update all URL construction and lookup logic.

## Changes

### 1. Database migration — add `slug` column
- Add `slug TEXT UNIQUE` to `discover_presets`
- Create a trigger function that auto-generates slug on INSERT/UPDATE:
  - Slugify the title (lowercase, replace spaces/special chars with hyphens)
  - Append first 6 chars of the UUID for uniqueness
  - E.g. `editorial-fashion-sunset-afca02`
- Backfill existing rows

### 2. `src/hooks/useDiscoverPresets.ts`
- Add `slug` to the `DiscoverPreset` interface

### 3. Slug helper — `src/lib/slugUtils.ts` (new)
- `getItemSlug(item: DiscoverItem)` — returns `item.data.slug` for presets, `scene-{poseId}` for scenes
- `getItemUrlPath(item: DiscoverItem)` — returns `/discover/{slug}`

### 4. `src/pages/PublicDiscover.tsx`
- Update `getItemUrl` to use slug instead of raw ID
- Update auto-open logic: match `urlItemId` against both `slug` and `id` (backward compat)

### 5. `src/pages/Discover.tsx`
- Same slug-based URL changes

### 6. Share URLs in modals
- `PublicDiscoverDetailModal.tsx` — use slug in `SharePopover` url
- `DiscoverDetailModal.tsx` — use slug in `SharePopover` url

### 7. Backward compatibility
- URL lookup checks both slug and UUID so old shared links still work

### Files
- Database migration (new `slug` column + trigger + backfill)
- `src/hooks/useDiscoverPresets.ts`
- `src/lib/slugUtils.ts` (new)
- `src/pages/PublicDiscover.tsx`
- `src/pages/Discover.tsx`
- `src/components/app/PublicDiscoverDetailModal.tsx`
- `src/components/app/DiscoverDetailModal.tsx`

