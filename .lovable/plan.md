## Remove the SEO link strip on the home page

The thin row showing "AI product photography · AI product photo generator · Shopify product photos" lives in `src/components/home/HomeFinalCTA.tsx` as a second `<section>` rendered right under the dark "Get started" CTA.

## Change

In `src/components/home/HomeFinalCTA.tsx`:
- Remove the entire second `<section className="bg-[#FAFAF8] py-10">…</section>` block (lines 48–65)
- Remove the now-unused `seoLinks` array (lines 4–8)
- Drop the wrapping fragment `<>…</>` since only one section remains, returning the dark CTA section directly

No other files touched. Footer and other navigation already cover those links.
