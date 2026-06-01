## Bugs found on `/ai-product-photography/wedding-dresses`

### 1. Missing reciprocal related-categories link (the one you flagged)
`src/data/aiProductPhotographyCategoryPages.ts` line **1546** — the **Dresses** page's `relatedCategories` is:
```
['fashion', 'lingerie', 'swimwear', 'jewelry']
```
It does **not** include `wedding-dresses`, even though Wedding Dresses links back to `dresses`. Result: no entry point from the Dresses category page (or its "Related categories" block) to Wedding Dresses.

**Fix:** swap `'jewelry'` for `'wedding-dresses'` so Dresses lists:
```
['fashion', 'lingerie', 'swimwear', 'wedding-dresses']
```

### 2. Stale preview thumbnails on the hub grid card
`src/data/aiProductPhotographyCategories.ts` line **161** (Wedding Dresses card on `/ai-product-photography`) still uses the old image IDs that you just replaced in the hero collage:
- `1778332154533-vr8cht` (old Atelier)
- `1780307463188-xreub7` (old Garden)

**Fix:** update `previewImages` to match the new collage:
```
['1780307460213-9gm38b', '1780316713430-ogxh2r', '1780309211434-wj44g2']
```
(hero + new Studio + new Garden)

### Scope
Two small data edits only in `src/data/aiProductPhotographyCategoryPages.ts` and `src/data/aiProductPhotographyCategories.ts`. No component or styling changes.