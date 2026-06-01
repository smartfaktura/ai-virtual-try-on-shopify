## Add "Whole feed" section to /ai-product-photography/phone-cases

Mirror the existing CategoryFeedShowcase pattern used by wedding-dresses, swimwear, eyewear, etc.

### Steps

1. **Upload feed image** — push `user-uploads://phonecasesfeed-1.jpg` to Lovable Assets as `src/assets/seo/phone-cases-feed.jpg.asset.json` (CDN pointer; no binary in repo).

2. **Register slug in `src/components/seo/photography/category/CategoryFeedShowcase.tsx`**:
   - Import `phoneCasesFeed from '@/assets/seo/phone-cases-feed.jpg'`
   - Extend `FeedSlug` union with `'phone-cases'`
   - Add `FEED_BY_SLUG['phone-cases']` entry:
     - eyebrow: `One case · Whole feed`
     - heading: `Your entire phone case feed from a single upload`
     - subline: warm, sun-drenched lifestyle copy matching the page tone
     - alt: descriptive alt for the curated IG feed

3. **No changes** to `aiProductPhotographyCategoryPages.ts` or routing — the showcase is rendered automatically for any slug present in `FEED_BY_SLUG` (same as wedding-dresses).
