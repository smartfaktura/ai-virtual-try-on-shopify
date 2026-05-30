Two fixes to `src/components/app/BulkUploadReviewModal.tsx`:

1. **Use canonical category list** — Replace the hard-coded `CATEGORY_GROUPS` with the shared `CATEGORY_SUPER_GROUPS` + `CATEGORY_LABELS` from `src/lib/productCategories.ts` so all categories (Phone Cases, Eyewear, Wedding Dress, Supplements & Wellness, Other, etc.) appear and stay in sync with the rest of the app.

2. **More breathing room between value and pill** — Inside the SelectTrigger:
   - Bump gap from `gap-3` to `gap-6` (with `sm:gap-8`)
   - Add `mr-1` on the Suggested pill so it sits clearly away from the chevron too
   - Keep truncation on the value so long labels still shorten gracefully on mobile

No logic / data changes beyond swapping the category source.