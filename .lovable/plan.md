

# Replace TryShot Showcase Images with Discover Feed Images

## What changes
Replace the 6 hardcoded local showcase images (beauty, sneakers, electronics, etc.) on `/tryshot` with images dynamically pulled from the `discover_presets` table — the same source powering the Discover page.

## File: `src/pages/TryShot.tsx`

1. **Remove local image imports** (lines 7-12) — delete all `import showcaseX from ...` lines
2. **Fetch discover presets** — add a query to load presets from `discover_presets` table (public/anon access is already enabled via RLS)
3. **Replace `CATEGORIES` array** — instead of hardcoded categories with local images, derive showcase items from the fetched presets. Pick one image per category (or just the first N presets) to populate:
   - The hero typewriter rotating images (`WORD_IMAGES`)
   - The "Works with most products" grid (`CATEGORIES`)
4. **Keep the typewriter words** — map each word to a matching discover preset by category (fashion, beauty, lifestyle, etc.). Fall back gracefully if a category has no preset.
5. **Loading state** — show skeleton placeholders while presets load

## Technical details

- Use `supabase.from('discover_presets').select('*').limit(20)` with anon key (no auth needed — RLS allows anon SELECT)
- Group presets by category, pick the first from each for the showcase grid
- For the rotating hero image, select 6 presets that best match the rotating words
- Delete the 6 local JPG files from `src/assets/tryshot/` to reduce bundle size
- Images will load from the CDN via `image_url` field — same optimization as Discover page

