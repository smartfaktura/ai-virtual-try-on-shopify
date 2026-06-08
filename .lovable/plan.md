# Swap Footwear → Activewear, Jackets → Bags & Accessories (creative scenes, not essentials)

**Scope:** frontend only — single file `src/components/home/HomeTransformStrip.tsx`. The "Explore AI product photography by category" tabs on `/` are driven by `CATEGORIES` in this file. No backend, no other section, no asset upload — every preview already lives in the public `product-uploads` bucket.

Per feedback, both new arrays skip the essential / e-commerce shots (flat-lay, ghost mannequin, front/back/side packshots, plain on-model front/back, basic close-ups). They favour lifestyle / editorial / styled scenes — the ones that show off VOVV.AI rather than basic catalog work.

## Activewear — replace `FOOTWEAR_CARDS` with `ACTIVEWEAR_CARDS`

| Label | Scene id (preview) |
|---|---|
| Movement Shot *(Original badge)* | `1780056568752-tb4ok4` |
| Blue Gradient Studio | `1776838027987-mbf6go` |
| Court Lines Golden | `1776838042880-aahpqn` |
| Poolside Power Flow | `1779350585137-r2ba9h` |
| Jungle Retreat Flow | `1779350584371-u9uryi` |
| Clifton Rock Flow | `1779351245239-vmha5z` |
| Urban Concrete | `1776838086063-vtd5sy` |
| Sunny Shadows | `1776838079872-s4rzia` |
| Open Sky Stretch | `1779350586741-5j51se` |
| Fisheye Portrait | `1776838311945-wihpw9` |
| Clean Studio Light | `1776838095499-uq31ie` |
| On-Model Editorial | `1780056572364-suiqtt` |

## Bags & Accessories — replace `JACKETS_CARDS` with `BAGS_CARDS`

| Label | Scene id (preview) |
|---|---|
| Reclined Studio Editorial *(Original badge)* | `1780060132900-b5fasg` |
| Volcanic Sunset | `1777880675405-os018h` |
| Dynamic Bloom Studio | `1777880657712-vbdpyt` |
| Botanical Oasis | `1777880653990-b5b1fn` |
| Sunny Shadows | `1777880674126-ze4qoe` |
| Dynamic Water Splash | `1777880659869-51ou19` |
| Dynamic Studio Background | `1777880658693-qop0cf` |
| Earthy Bubble Wrap | `1777880662254-s15wji` |
| Amber Glow Studio | `1777880652803-wd6fit` |
| Red Gradient Embrace | `1777880670453-dgeyxn` |
| Natural Woodscape | `1777880669255-k938tt` |
| Frozen Product | `1777880666022-ob9pal` |

## `CATEGORIES` array (lines 119–126)

```ts
{ id: 'watches',    label: 'Watches',             cards: WATCHES_CARDS,    hub: '/ai-product-photography/jewelry' },
{ id: 'swimwear',   label: 'Swimwear',            cards: SWIMWEAR_CARDS,   hub: '/ai-product-photography/fashion' },
{ id: 'activewear', label: 'Activewear',          cards: ACTIVEWEAR_CARDS, hub: '/ai-product-photography/fashion' },
{ id: 'bags',       label: 'Bags & Accessories',  cards: BAGS_CARDS,       hub: '/ai-product-photography/bags-accessories' },
{ id: 'eyewear',    label: 'Eyewear',             cards: EYEWEAR_CARDS,    hub: '/ai-product-photography/bags-accessories' },
{ id: 'fragrance',  label: 'Fragrance',           cards: FRAGRANCE_CARDS,  hub: '/ai-product-photography/fragrance' },
```

## Safe / out of scope

- No type changes — `CategoryId` is derived from the array, auto-updates.
- `ALL_CATEGORY_NAMES` dropdown already contains "Activewear" and "Bags & Accessories".
- All 24 preview URLs verified via `product_image_scenes` query against `category_collection` (`activewear`, `bags-accessories`), `is_active=true`.
- No `width=` param added (per Image Optimization No-Crop rule); cards use the existing `PREVIEW()` helper.

## Validation

- Hard reload `/`, scroll to "Explore AI product photography by category".
- Tab order: Watches · Swimwear · **Activewear** · **Bags & Accessories** · Eyewear · Fragrance.
- Each new tab shows 12 cards, "Original" badge on the first.
- Spot-open 2–3 cards per tab to confirm CDN URL resolves and shots are clearly creative/editorial (no plain packshots dominate).
- "View all" CTA on each tab routes to the listed hub.
