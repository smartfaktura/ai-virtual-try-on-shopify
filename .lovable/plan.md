## Plan: Seed one Socks scene

Insert a single row into `product_image_scenes` so a "Socks" category tab appears in `/app/admin/product-image-scenes` and in the user-facing Visual Studio Step 2.

### Row values

- `scene_id`: `socks_folded_pair_flat`
- `title`: `Folded Pair — Flat Lay`
- `description`: `Clean overhead flat lay of a folded sock pair on a neutral surface`
- `category_collection`: `socks` (drives the new tab)
- `scene_type`: `packshot`
- `aspect_ratio` defaults via builder; `is_active`: `true`
- `sort_order`: `0`, `category_sort_order`: `0`
- `prompt_template`: short overhead flat-lay prompt with soft daylight on warm paper background, both socks shown folded together, no shoes
- `trigger_blocks`: `{}` (no model/scene references needed)
- `owner_user_id`: NULL (global), `is_brand_scene`: false

### Safety

- Single INSERT into `product_image_scenes`, no schema change, no RLS edit
- Fully reversible: `DELETE FROM product_image_scenes WHERE scene_id='socks_folded_pair_flat'`
- Admin can edit the prompt/preview image afterwards in the admin UI

Risk: very low.
