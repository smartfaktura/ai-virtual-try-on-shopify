## Add 6 New Home Office Scenes

Insert 6 new design-forward, fully furnished Home Office scenes into `product_image_scenes`, following the exact pattern of existing Home Office scenes (same `COMPLETE INTERIOR COMPOSITION` directive, `PROPORTIONAL SCALE RULE`, NO LOGOS/SCREENS block, and conditional product-type logic).

### New Scenes (sort_order 160–165)

1. **Smoked Glass Loft Office** (160) — Floor-to-ceiling smoked glass partition, blackened steel desk frame, polished concrete floor, cognac leather task chair. Industrial-loft creative director energy.

2. **Warm Terracotta Writer's Room** (161) — Terracotta lime-wash walls, reclaimed elm writing desk, woven rattan chair, clay pendant lamp, sisal rug. Mediterranean warmth for focused work.

3. **Japandi Zen Study** (162) — Light hinoki wood desk, tatami-inspired woven flooring, rice-paper shoji screen partition, matte black task lamp, low-profile storage credenza. Serene and clutter-free.

4. **Midnight Library Office** (163) — Deep navy paneled walls floor-to-ceiling, built-in dark oak bookshelves, brass reading lamp, emerald velvet desk chair, herringbone parquet. Moody members-club study.

5. **Sage & Plaster Creative Studio** (164) — Sage green plaster walls, bleached ash trestle desk, linen-upholstered swivel chair, fluted travertine bookends, indoor fiddle-leaf fig. Soft biophilic palette.

6. **Alpine Timber Cabin Office** (165) — Exposed timber A-frame ceiling, wide-plank pine floors, stone-clad accent wall, sheepskin-draped desk chair, brass banker's lamp. Mountain-lodge work retreat.

### Technical Details

- Database: 6 `INSERT` statements via the insert tool (data operation, not schema change)
- Each prompt includes the full `COMPLETE INTERIOR COMPOSITION` conditional block, `PROPORTIONAL SCALE RULE`, and `NO LOGOS OR SCREENS` directive
- `category_collection = 'furniture'`, `sub_category = 'Home Office'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
