## Swimwear page refresh — expanded chip grid + Scene Examples

The live scene library has **69 swimwear scenes**. Today the chip grid only surfaces ~35 of them. This plan reorganizes the chips into **7 themed groups, each at the 8-card cap**, so the page shows **52 scenes** instead of 35 — and uses the fresh `177934…` Maldives / Cape Town / Aegean / White Lotus / Villa batch that's currently missing.

Two data files only. No component, route, hook, or backend changes.

## 1. Chip grid — `aiProductPhotographyBuiltForGrids.ts` (swimwear block)

New chip structure (renamed where it makes the grouping cleaner):

### Chip 1 — `Swimwear · Resort Editorial` (8)
- Sunlit Arch Swim Editorial · `1776522810241-oh3lyd`
- Sun Lounger Resort Pose · `1776246328634-fw8s9o`
- Cabana Curtain Movement · `1776522770222-za8n2n`
- Resort Staircase Pose · `1776246324066-hu5ob2`
- Resort Bokeh Swim Editorial · `1776522789403-pnvcux`
- Seated Balcony Resort Portrait · `1776246325971-mrh821`
- Yacht Deck Editorial Pose · `1777996843133-j8fyxu`
- Architectural Stair Swim Editorial · `1777996827311-gx5s9t`

### Chip 2 — `Swimwear · Villa & Resort Mood` *(new chip)* (8)
- Private Villa Glow · `1779344972409-ntn94t`
- White Lotus Glow · `1779347039851-qiw1ib`
- Villa Shade Siren · `1779347035251-z5k8cv`
- Jungle Villa Afterglow · `1779347010918-7zu59q`
- Resort Mirror Heat · `1779347024318-h43k3f`
- Villa Espresso Walk · `1779347030368-pgte54`
- Island Flash Hour · `1779347005284-g2tttx`
- Poolside Fever Dream · `1779344965626-u2ro8h`

### Chip 3 — `Swimwear · Mediterranean` *(new chip)* (6)
- Aegean Deck Siren · `1779346999911-klrly1`
- Aegean Cliff Siren · `1779348543991-txp84o`
- Cape Town Siren · `1779344951443-20h9xc`
- Coastal Stillness Swim Frame · `1777996830864-yd13ny`
- Golden Horizon Swim · `1777996832895-0e40jt`
- Minimal Horizon Swim Editorial · `1776574730668-ltg55f`

### Chip 4 — `Swimwear · Maldives & Tropics` *(new chip)* (6)
- Maldives It Girl · `1779343672535-j0u73e`
- Maldives Palm Girl · `1779343681835-hd7hp3`
- Maldives Bicycle Girl · `1779343666035-zdhcpb`
- Sun Chaser Girl · `1779348545288-6ot498`
- Golden Sand · `1779344959426-hzoaie`
- Yacht Bow Swim Editorial · `1777996842051-0zknjz`

### Chip 5 — `Swimwear · Pool & Beach UGC` (8)
- Towel Wrap After Swim · `1776246331485-jyrtgf`
- Floating Pool Product Shot · `1777996831843-l3w3d6`
- Palm Shadow Swim Editorial · `1776522783936-8h56rb`
- Walking Along Pool Edge · `1777996839874-rwutl7`
- Sun-Dried Swimwear · `1777996837190-gozhuc`
- Beach Towel Sitting Moment · `1776246304639-tjof8z`
- Shoreline Walk Pause · `1777996836335-qaub4x`
- Poolside Friend-Shot Candid · `1777996833942-pm1vjo`

### Chip 6 — `Swimwear · Aesthetic Color` (5)
Already strong — keep as-is, no source-able alternatives:
- Color-Washed Resort Wall · `1777996990945-7t4iqw`
- Aesthetic Color Poolside Story · `1777996986914-n16g2p`
- Aesthetic Color Towel and Fabric Story · `1777996989794-75995p`
- Aesthetic Color Sunset Resort Mood · `1777996988655-w0z9fg`
- Aesthetic Color Resort Editorial Hero · `1777996987704-clgu3v`

### Chip 7 — `Swimwear · Stills & Flat-Lay` (renamed from "Stills") (4)
- Folded on Towel Hero Still · `1776246310078-jeoctl`
- Sandy Towel Surface Detail · `1776246325029-44re6c`
- Water Reflection Still Life · `1776246333620-ntl6rn`
- Resort Essentials Flat · `1776246329554-uvtjp1`

### Chip 8 — `Swimwear · Essential Shots` (5) — unchanged
PDP angles, kept as the closer:
- Ghost Mannequin Shot · `1776523219756-c5vnc7`
- On-Model Front · `1776246318297-apxkit`
- On-Model Back · `1776246316545-ge07py`
- On-Model Editorial · `1776246317384-rtaqcj`
- Movement Shot · `1776246314604-0psi6v`

**Coverage:** 8 chips × ~6.5 avg = **~52 scenes shown** (up from ~35), using the freshest editorial batch where it exists.

All imageIds verified to exist in the live `product_image_scenes` table.

## 2. Scene Examples grid — `aiProductPhotographyCategoryPages.ts` (swimwear `sceneExamples`)

Pick 8 fresh scenes that don't appear in the first chip (Resort Editorial), so the page feels new as the user scrolls:

1. Maldives It Girl — Editorial Resort Poses — `1779343672535-j0u73e`
2. White Lotus Glow — Aesthetic Color Stories — `1779347039851-qiw1ib`
3. Cape Town Siren — Editorial Resort Poses — `1779344951443-20h9xc`
4. Poolside Fever Dream — Pool / Beach Lifestyle UGC — `1779344965626-u2ro8h`
5. Aegean Deck Siren — Editorial Resort Poses — `1779346999911-klrly1`
6. Sandy Towel Surface Detail — Wet Surface Stills — `1776246325029-44re6c`
7. Villa Espresso Walk — Pool / Beach Lifestyle UGC — `1779347030368-pgte54`
8. Maldives Palm Girl — Editorial Resort Poses — `1779343681835-hd7hp3`

Each entry: `label`, `category`, `imageId`, `collectionLabel: 'Swimwear'`, `subCategory`, descriptive `alt`. Schema unchanged.

## 3. Subtitle copy

The Scene Examples subtitle ("Studio, lifestyle, editorial, and seasonal — one click.") is a generic line in the shared component used by **every** category page. Two options:

- **(A)** Leave it as-is — zero risk to other category pages. *Recommended.*
- **(B)** Branch the copy by `page.slug === 'swimwear'` to show e.g. *"Resort, Maldives, Mediterranean and poolside editorials — one click"*. Tiny 1-line component change, only affects swimwear.

If you don't tell me, I'll go with **(A)**.

## What does NOT change

- Hero collage at the top of the page (different section).
- All other category pages (chip data is keyed by `slug: 'swimwear'`).
- No component, route, hook, or backend changes.
- No SEO/schema/canonical changes.

## Verification

1. Open `/ai-product-photography/swimwear` in preview — 8 chips render with the new groupings, each shows the new imagery, Scene examples grid below shows 8 fresh scenes.
2. No console errors. All ~60 images load.
3. `tsc` passes (typed data file).
