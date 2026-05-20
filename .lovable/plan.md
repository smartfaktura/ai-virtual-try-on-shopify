## 1) Hide "Why this category is hard" + "Use cases" on swimwear

`src/pages/seo/AIProductPhotographyCategory.tsx` — extend the existing gate that currently hides them on bags:

```ts
const hidePainAndUseCases = page.slug === 'bags' || page.slug === 'swimwear';
```

Apply to both `<CategoryPainPoints>` and `<CategoryUseCases>`. Other categories keep both sections.

## 2) "Related product photography categories" — show all, last section on every page

### Show all categories
`src/components/seo/photography/category/CategoryRelatedCategories.tsx`:
- Replace `getRelatedPages(page.relatedCategories)` with the full `aiProductPhotographyCategoryPages` array, filtered to exclude the current page (`p.slug !== page.slug`).
- Export a tiny helper `getAllOtherCategoryPages(currentSlug)` from the data file (cleaner than importing the full array into the component).

### Last section on every page
`src/pages/seo/AIProductPhotographyCategory.tsx` — collapse the two conditional mounts into one final mount, after `<PhotographyFinalCTA />`:
```
<CategoryFAQ />
<PhotographyFinalCTA />
<CategoryRelatedCategories />   ← always last, all pages
```
Remove the `!isBags` and `isBags` branches around it.

### Layout for ~18 cards
Current grid is `md:grid-cols-3`. With 18 cards that becomes a tall stack. Bump to `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` and tighten card padding from `p-5 lg:p-6` to `p-4 lg:p-5` so the section stays scannable on desktop. Heading + "All AI product photography categories" link unchanged.

`relatedCategories` field on each page entry stays in the data (still used by SEO/JSON-LD elsewhere if needed); the UI just stops reading from it.

## Out of scope
Hero, motion/feed sections, FAQ, copy changes on other pages. No data deletions. No admin override slot changes (existing `related_{slug}_1..3` slots still work since slug-based slot keys remain unique).