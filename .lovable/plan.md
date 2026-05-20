## Why it's wrong now

When an admin picks a scene in `/app/admin/seo-page-visuals`, the override is saved with `alt_text` auto-set to the slot's generic `fallbackAlt` (e.g. `"Bags AI product photography example"`). My previous `resolveSlotLabel` preferred `alt_text` first, so the hover caption ends up showing that long SEO sentence instead of the scene's title.

## Fix

In `src/lib/resolveSlotImage.ts`, change `resolveSlotLabel` priority for the **hover caption** to:

1. The override scene's title from the public scene library (via `sceneTitleById`)
2. The hardcoded `fallbackLabel`

Drop `alt_text` from label resolution — `alt_text` exists for the image `alt` attribute (SEO), not the visible UI label. `resolveSlotAlt` continues to use it as today, so the `<img alt>` keeps the SEO sentence.

No changes needed in `CategoryBuiltForEveryCategory.tsx`; it already passes `sceneTitleById`.

### Result on `/ai-product-photography/bags`

Hover label on a swapped tile becomes just the scene title (e.g. `Sculptural Bag Studio Hero`) — matching what the user sees in the picker. SEO `alt` text is unchanged.

### Files

- edit `src/lib/resolveSlotImage.ts` — remove the alt_text branch from `resolveSlotLabel`
