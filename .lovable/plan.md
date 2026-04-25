## Goal
On `/home`: swap the **Bags** category for **Watches**, fix the Models marquee load quality, refine the Models copy, drop in a shorter "Your AI Creative Studio" block, and add the "Every environment. One click." scenes section right before the FAQ.

---

## 1. Swap Bags → Watches in HomeTransformStrip

In `src/components/home/HomeTransformStrip.tsx`:

- Replace the `BAGS_CARDS` array with a new `WATCHES_CARDS` array (12 entries) using the verified watch scene preview filenames:
  - Original: `1776596629281-anqgf5` (On-Wrist Studio)
  - Front View · Side View · Angle View · Back View · On-Wrist Studio · On-Wrist Lifestyle · Close-Up Detail · Texture Detail · Hard Shadow Hero · Flat Lay Styled · Earthy Glow Stage · Gradient Backdrop Elegance · Concrete Shadow Play
- Update the `CATEGORIES` tuple: replace `{ id: 'bags', label: 'Bags', cards: BAGS_CARDS }` with `{ id: 'watches', label: 'Watches', cards: WATCHES_CARDS }`.

## 2. Fix Models marquee image loading

In `src/components/landing/ModelShowcaseSection.tsx`:

- Wrap `model.previewUrl` with `getOptimizedUrl(model.previewUrl, { quality: 60 })` in `ModelCardItem` so all 100+ marquee tiles load as compressed images instead of raw originals (this is what makes the row look slow and inconsistent).
- Add `decoding="async"` and a stable aspect-ratio placeholder (already present via `aspectRatio="3/4"` — keep).
- Add a one-time preconnect to the Supabase storage origin inside `ModelsMarquee` `useEffect` (matches the pattern used in `HomeTransformStrip`).

## 3. Improve Models section copy

In `src/components/home/HomeModels.tsx`, mirror the BrandModels voice (Every face. Every story.):

- Eyebrow: `Models · {count}+ ready-to-shoot`
- Title: **Your cast. Ready in seconds.**
- Subtitle: *Pick from 40+ professional AI models across every body type, ethnicity, and age — or train your own brand model in minutes and shoot it forever.*

## 4. Add a shortened "Your AI Creative Studio" block to /home

Create `src/components/home/HomeStudioTeam.tsx` — a stripped-down version of `StudioTeamSection`:

- Same eyebrow `Your AI Creative Studio` + headline `10 specialists. Zero overhead.`
- Subtitle shortened to one line: *A dedicated AI creative crew that ships studio-grade visuals on demand.*
- Reuse the existing `TEAM_MEMBERS` carousel logic (import the carousel JSX from `StudioTeamSection`) — to keep it short, render a smaller card size (`w-[200px] sm:w-[220px] lg:w-[240px]`) and remove the bottom CTA button, replacing it with a single ghost link "Meet the team →" routing to `/team`.
- Reduce vertical padding to `py-14 lg:py-24` so it feels lighter than the full version on `/`.

Mount it in `src/pages/Home.tsx` between `HomeWhySwitch` and `HomeOnBrand`.

## 5. Add Environment/scenes section to /home

Create `src/components/home/HomeEnvironments.tsx` that wraps `EnvironmentShowcaseSection` with refreshed copy:

- Eyebrow: `1600+ scenes`
- Title: **Every environment. One click.**
- Subtitle: *Studio, lifestyle, editorial, streetwear — place your products in any setting instantly.*

The simplest implementation: extract the marquee body of `EnvironmentShowcaseSection` into a reusable `EnvironmentsMarquee({ eyebrow, title, subtitle })` (same pattern as `ModelsMarquee`), keep the existing `ROW_1`/`ROW_2` data, and have `HomeEnvironments` call it with the new strings. Update existing `EnvironmentShowcaseSection` to call the same component with its current copy so the landing page `/` is unaffected.

Mount `<HomeEnvironments />` in `src/pages/Home.tsx` **right before `<HomeFAQ />`**.

---

## Final Home.tsx order
```
HomeHero
HomeTransformStrip       (Watches now in pills)
HomeModels               (refined copy)
HomeCreateCards
HomeHowItWorks
HomeWhySwitch
HomeStudioTeam           (NEW — shorter)
HomeOnBrand
HomeEnvironments         (NEW — 1600+ scenes)
HomeFAQ
HomeFinalCTA
```

## Files touched
- `src/components/home/HomeTransformStrip.tsx` — swap Bags → Watches
- `src/components/landing/ModelShowcaseSection.tsx` — optimize image URLs, extract `EnvironmentsMarquee` (no — that file is models; environment refactor lives in EnvironmentShowcaseSection)
- `src/components/landing/EnvironmentShowcaseSection.tsx` — extract reusable `EnvironmentsMarquee`
- `src/components/home/HomeModels.tsx` — new copy
- `src/components/home/HomeStudioTeam.tsx` — NEW (shorter team carousel)
- `src/components/home/HomeEnvironments.tsx` — NEW (wraps `EnvironmentsMarquee`)
- `src/pages/Home.tsx` — mount the two new sections in the right slots