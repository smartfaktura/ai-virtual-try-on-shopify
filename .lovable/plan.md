## Fix phone-cases feed import error

I uploaded `phone-cases-feed.jpg` as a Lovable Assets CDN pointer (`.asset.json`), but the other feed images are real JPGs imported directly. Vite cannot resolve `@/assets/seo/phone-cases-feed.jpg` because only the `.asset.json` pointer exists.

### Fix

In `src/components/seo/photography/category/CategoryFeedShowcase.tsx`:

- Change the import to `import phoneCasesFeed from '@/assets/seo/phone-cases-feed.jpg.asset.json';`
- Use `phoneCasesFeed.url` (string) in the `FEED_BY_SLUG['phone-cases'].image` field

The `image` field already accepts a `string`, so `.url` matches its type. No other changes.
