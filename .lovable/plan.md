## 1. Critical fix: revert image zoom across all SEO photography pages

The previous performance pass added a `width` parameter to `getOptimizedUrl(...)` calls. Per the project's no-crop rule, `width` without `height` makes Supabase's image renderer crop server-side, producing the zoomed-in look you're seeing. We will switch every full-bleed/grid/collage image back to **quality-only** optimization.

Files to fix (5 call sites):
- `CategoryHero.tsx` — collage tiles + single hero image → `{ quality: 70 }` only
- `CategoryBuiltForEveryCategory.tsx` — chip grid → `{ quality: 60 }` only
- `CategorySceneExamples.tsx` — scene grid → `{ quality: 60 }` only
- `CategoryRelatedCategories.tsx` — 3-image collage thumbs → `{ quality: 60 }` only

We keep `loading="lazy"`, `decoding="async"`, deferred chip rendering, and `fetchpriority="high"` on heroes — those don't crop. To recover the load-time benefit lost from dropping `width`, we'll keep quality at 60 for grid tiles (smaller payload than 70/72) and continue lazy-loading everything below the fold.

## 2. Hub banner (/ai-product-photography) — fix wrong names/images

Audit `src/data/aiProductPhotographyCategories.ts` and `PhotographyCategoryChooser.tsx` against the live category pages, then:
- Re-pick `previewImage` IDs so each category card shows an on-subject scene (e.g., bags should be a bag, jewelry a jewelry shot, electronics tech, supplements a supplement bottle, food a food shot).
- Verify `name`, `description`, and `shotCount` strings match the actual category page content/intent.
- Use the same `getRelatedThumbs` style 3-tile collage on the hub cards so the hub mirrors the polished related-categories design (optional polish — only if it doesn't visually clash).

## 3. Redesign "One product photo. A full visual system." section

Current `PhotographyVisualSystem.tsx` is 8 dense text cards in a 4-col grid → feels like a feature list. Redesign:
- Collapse to **6 outputs** by merging overlapping items: drop "Website banners" (covered by Campaign visuals) and "Product launch assets" (covered by Campaign visuals); keep Product page, Lifestyle, Social, Paid ads, Detail shots, Campaign visuals.
- Move to a **3-col x 2-row** layout with more breathing room.
- For each card: keep icon + short title, **shorten copy to one tight line** (max ~60 chars).
- Add a small visual sample thumbnail on each card (16:9 image from `PREVIEW(...)` matching the output type) so the section becomes visual-first instead of text-first.
- Tighten the heading: "One product photo. A full visual system." stays, subheadline trimmed to one short sentence.

## 4. Audit & improvement pass for the 10 category pages

We'll work through each `/ai-product-photography/<slug>` and answer the 5 questions. Findings drive concrete edits in `aiProductPhotographyCategoryPages.ts` and components.

### Q1 — Uniqueness
Quick audit of pain points, FAQs, scene examples, and visual outputs per page. Where copy is too generic or repeats verbatim across pages, rewrite to category-specific language (e.g., "ingredient hero shots" for beauty, "macro pour shots" for beverage, "on-wrist lifestyle" for watches, "thread-level macro" for fashion, "teardown flat-lay" for electronics).

### Q2 — SEO
- Verify each page has a unique `<title>`, meta description, H1, canonical URL, breadcrumbs, FAQ schema (`JsonLd`), and image `alt` attributes that include the category keyword once (no stuffing).
- Fix any duplicate H1/title patterns.
- Confirm internal links to related categories are real, anchor text varies.

### Q3 — UI/UX premium feel
After image zoom is fixed, all pages will visually match `/home`. Additional polish:
- Replace any remaining heavy gradients with frosted pill labels (already partly done).
- Ensure section background rhythm alternates `#FAFAF8` ↔ `bg-background` ↔ `#f5f5f3`.

### Q4 — Conversion structure
Each page already has: hero → built-for grid → scene examples → use cases → visual outputs → related categories → FAQ → final CTA. We'll verify the CTA appears at hero AND above-the-fold-of-FAQ, and that the "See examples" anchor works on every page.

### Q5 — SEO grouping recommendations
After audit, surface a short recommendation list (no immediate URL changes — those affect indexing). Likely calls:
- Rename "Electronics & Gadgets" page H1/title to lead with "Electronics" (higher intent), keep "gadgets/tech" as supporting keywords.
- Keep "Home & Furniture" as one page for now; flag a future split into `/home-decor` + `/furniture` once traffic justifies it.
- Beauty & Skincare: add explicit "makeup" keyword coverage in H1/subheadline + at least one makeup scene example.
- Bags & Accessories: confirm watches + eyewear sub-sections deserve dedicated future pages.
- Fragrance, Jewelry, Footwear, Fashion, Food & Beverage, Supplements & Wellness: keep as-is.

We will deliver these recommendations as inline copy edits where safe and as a written summary at the end of the change.

## 5. Acceptance checklist
- No `width` parameter on any full-bleed image in the SEO photography stack.
- Hub banner shows correct on-subject imagery and accurate category names.
- Visual System section: 6 cards, breathing room, optional sample thumb, no text wall.
- Each of the 10 category pages: unique H1/title/meta, on-subject hero, no duplicated copy across pages.
- Build passes TypeScript cleanly.

## Technical notes
- All edits stay inside `src/components/seo/photography/**` and `src/data/aiProductPhotography*.ts`.
- No DB migrations.
- No changes to `src/integrations/supabase/*`.
- Memory rule `mem://style/image-optimization-no-crop` will be respected and re-applied to any future image work in this stack.
