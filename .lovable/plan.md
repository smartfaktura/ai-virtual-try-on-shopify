## Problem

On `/ai-product-photography/bags` (and any SEO category page using the "Built for every X shot" grid), admins can replace a slot's image via `/app/admin/seo-page-visuals`. The image updates, but the hover label still shows the **original** card label hardcoded in `aiProductPhotographyBuiltForGrids.ts` — because only the image URL is resolved through the override, not the label.

This affects every page that uses `CategoryBuiltForEveryCategory` — not just bags.

## Fix

Make the hover label follow the override whenever one exists, falling back to the hardcoded card label otherwise.

### 1. New helper in `src/lib/resolveSlotImage.ts`

Add `resolveSlotLabel(overrides, pageRoute, slotKey, fallbackLabel, sceneTitleLookup)`:
- If an override row exists and has `alt_text` → use it.
- Else if the override's `scene_id` matches a scene in the public library → use that scene's `title`.
- Else → return `fallbackLabel`.

### 2. Update `CategoryBuiltForEveryCategory.tsx`

- Pull `scenes` from `usePublicSceneLibrary` (already used by the admin picker, cached via React Query so no extra cost).
- Build a `Map<scene_id, title>` once with `useMemo`.
- In the grid render, compute `const resolvedLabel = resolveSlotLabel(overrides, page.url, slotKey, card.label, sceneTitleById)` and use it in both the hover caption and the `alt` text.

### 3. Scope

- Only `CategoryBuiltForEveryCategory` is touched for label resolution in this pass — that's the component the user is referring to.
- No data-file edits, no admin tooling changes, no schema changes.

### Files

- edit `src/lib/resolveSlotImage.ts` — add `resolveSlotLabel`
- edit `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — wire scene-title lookup + use new helper for hover label and alt

### Result

Whenever an admin swaps a scene in `/app/admin/seo-page-visuals`, the hover name on that tile automatically becomes the new scene's title (or admin-provided alt text). No manual code change needed per swap, and the bug doesn't return on any other SEO category page.
