## 1. Remove the orphan "What we cover in {category}" chip section

The `CategorySubcategoryChips` section is redundant — `CategoryBuiltForEveryCategory` already shows every subcategory as a clickable chip rail with images and labels. The standalone chip row floating between the hero/built-for grid and the visual outputs reads as a stray, unstyled list and adds no info.

**Action**: Delete the `<CategorySubcategoryChips />` section from `src/pages/seo/AIProductPhotographyCategory.tsx` (and its import). Leave the component file in place in case it's reused elsewhere.

## 2. Shorten the hero CTAs (no more long "See bags & accessories examples")

Current secondary CTA expands to up to ~32 chars on bags & accessories which makes the two pills look stuck together visually.

**Action** in `CategoryHero.tsx`:
- Primary CTA → keep "Create your first visuals free", with arrow.
- Secondary CTA → change from `See {groupName.toLowerCase()} examples` to a single short label: **"See examples"** (always 12 chars, anchors to `#scenes`).
- Tighten button padding from `px-8` to `px-7` and gap to `gap-3` so the two pills breathe.

This applies to all 10 category pages (one component, one change).

## 3. Hub: bring "Choose your product category" cards in line with the related-categories aesthetic

The `/ai-product-photography` hub uses single-image vertical cards. The new related-categories design uses a clean **3-image horizontal collage** thumbnail. The user wants the hub to match.

**Action**: Rewrite `PhotographyCategoryChooser.tsx` so each card uses the same 3-image horizontal collage (16:9) on top, with the category name + short description + arrow underneath. Pull the 3 thumbs from a curated `previewImages: [id, id, id]` field added to `aiProductPhotographyCategories.ts` (one per category, on-subject). Card layout will visually mirror `CategoryRelatedCategories.tsx` (rounded-3xl, hairline border, hover lift).

Required data change in `src/data/aiProductPhotographyCategories.ts`:
- Add `previewImages: string[]` (3 ids) per category, populated with on-subject scene ids already used elsewhere in the codebase.
- Keep existing `previewImage` for backwards compat / fallback.

## 4. Acceptance checklist

- "What we cover" chip section gone from all 10 category pages.
- Hero secondary CTA reads "See examples" everywhere; the two pills no longer collide visually.
- Hub `/ai-product-photography` category cards show 3-image horizontal collages matching the related-categories style.
- TypeScript build passes.
- No `width` parameter sneaks back into `getOptimizedUrl` calls (no-crop rule still in effect).

## Technical notes

Files touched:
- `src/pages/seo/AIProductPhotographyCategory.tsx` (remove section + import)
- `src/components/seo/photography/category/CategoryHero.tsx` (CTA copy + spacing)
- `src/components/seo/photography/PhotographyCategoryChooser.tsx` (rewrite to collage card)
- `src/data/aiProductPhotographyCategories.ts` (add `previewImages` triplet per category)

No DB migrations. No changes to Supabase config.
