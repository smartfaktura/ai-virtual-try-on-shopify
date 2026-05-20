## Show only 3 related categories per page

Revert the "show all" change and go back to the curated 3-per-page list, but keep Related as the final section on every page (the section-order change stays).

### Changes

`src/components/seo/photography/category/CategoryRelatedCategories.tsx`
- Swap import back to `getRelatedPages` (drop `getAllOtherCategoryPages`).
- `const related = getRelatedPages(page.relatedCategories);`
- Restore grid to `grid-cols-1 md:grid-cols-3` (3 cards fit cleanly, no need for the 4-col xl layout).
- Restore card padding to `p-5 lg:p-6`.

`src/data/aiProductPhotographyCategoryPages.ts`
- Keep `getAllOtherCategoryPages` helper in place (harmless, no other callers) OR remove it. Default: remove, since it's now unused.

### Untouched
- Section order in `AIProductPhotographyCategory.tsx` — Related stays as last section after FAQ + FinalCTA on every page.
- Swimwear pain/use cases hide stays.
- Each page's existing `relatedCategories: string[]` data drives which 3 show. No data edits.