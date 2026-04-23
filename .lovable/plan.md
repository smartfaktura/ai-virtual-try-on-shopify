

## Steal the Look — projected scene counts after merging recommended scenes

Today the dashboard reads only `discover_presets` (~390 items, with Footwear/Watches at **0**). After the planned merge it will also include **497 recommended scenes**, distributed across families as follows.

### By family (presets + recommended)

| Family chip | Presets today | + Recommended | **Total visible** |
|---|---:|---:|---:|
| Fashion (garments, jackets, dresses, jeans, hoodies, lingerie, swimwear) | 102 | 101 | **203** |
| Beauty & Fragrance (skincare, makeup, fragrance) | 82 | 50 | **132** |
| Home (decor, furniture) | 134 | 26 | **160** |
| Bags & Accessories (bags, backpacks, belts, scarves, hats, wallets, eyewear) | 37 | 112 | **149** |
| Footwear (sneakers, shoes, boots, heels) | 0 | 61 | **61** |
| Watches | 0 | 18 | **18** |
| Jewelry (rings, earrings, necklaces, bracelets) | 9 | 54 | **63** |
| Food & Drink (food, beverages, snacks) | 5 | 32 | **37** |
| Tech (tech-devices) | 5 | 15 | **20** |
| Wellness (supplements) | 1 | 25 | **26** |
| Activewear | — | 18 | **18** |
| **All** | **~390** | **497** | **~887** |

### What this means in the UI

- Every chip in the screenshot will have content — Footwear (61), Watches (18), Jewelry (63), Wellness (26), Eyewear (18) are no longer empty.
- The grid still shows only the first **16 tiles per chip** (existing `visible = filtered.slice(0, 16)`), sorted featured-first then newest. So users see 16 at a time; the rest are reachable on `/app/discover`.
- The "hide empty chips" safeguard from the prior plan stays in — but in practice no family will be empty after the merge.

### Notes

- Counts are a ceiling. The active filter `is_active = true` is already applied; admin-hidden scenes via `hidden_scenes` would subtract a small number.
- "All" in the chip bar will deduplicate correctly because presets and recommended items use distinct IDs (`preset.id` vs `rec-{scene_id}`).
- No DB changes needed. The merge is purely a client-side hook addition in `DashboardDiscoverSection.tsx` as previously planned.

