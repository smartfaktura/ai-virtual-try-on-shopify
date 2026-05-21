# Remove the 6 broken furniture-lifestyle scenes from Discover

## What's happening

Six scenes show up as broken cards on the public Discover view:

- Penthouse Panorama Lounge
- Ivory Bouclé Salon
- Nordic Fjord Living
- Grand Atelier Salon
- Walnut & Travertine Den
- Smoke & Stone Loft

They live in `product_image_scenes` as `furniture-lifestyle-*` rows. Their `preview_image_url` files exist in storage (HTTP 200), but the rendered cards in your screenshot are clearly broken / empty. Rather than chase a rendering edge case for scenes you don't want to surface anyway, the cleanest fix is to take them out of all public surfaces.

## Fix

A single, reversible migration that marks the six rows `is_active = false` in `product_image_scenes`:

```sql
UPDATE public.product_image_scenes
SET is_active = false
WHERE scene_id IN (
  'furniture-lifestyle-penthouse-panorama',
  'furniture-lifestyle-ivory-boucle-salon',
  'furniture-lifestyle-nordic-fjord',
  'furniture-lifestyle-grand-atelier-salon',
  'furniture-lifestyle-walnut-travertine-den',
  'furniture-lifestyle-smoke-stone-loft'
);
```

This removes them from:

- The public Discover RPC (`get_public_recommended_scenes` already filters `is_active = true`)
- The authenticated `/app/discover` recommended list
- The Product Images scene picker
- Any SEO category grid that pulls live scene previews

If you ever want them back, flip `is_active` back to `true` — nothing is deleted.

## Scope

- One DB migration. No code changes, no UI changes, no asset deletion.
- The underlying preview JPGs stay in storage in case you want to revive these later or reuse the images.

## Out of scope

- Investigating why Lovable Preview rendered them as broken (probably masonry/optimizer edge case with these specific JPGs). Not worth fixing for scenes you're removing anyway.
- Touching `recommended_scenes` (they aren't recommended, so nothing to clean there).
- Touching `discover_presets` (they aren't presets either).
