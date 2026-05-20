## Scope
Bag page only (`/ai-product-photography/bags`). All other category pages remain unchanged.

## Section changes on `bags`

Hide on bags:
- `CategoryBuiltForEveryCategory` ("Built for bags teams shipping every week") — redundant
- `CategoryVisualOutputs` ("What VOVV creates / One bags photo. A full visual system.")
- `CategorySceneExamples` ("Bags scenes built for e-commerce")
- `CategoryUseCases`

Reorder: `CategoryRelatedCategories` ("Explore more") becomes the **last** section on bags — moved to after `PhotographyFinalCTA` (or, if you'd rather, replace FinalCTA position — see Question below).

## Resulting bags order

```
Breadcrumbs
Hero
CategoryFeedShowcase
CategoryPainPoints
PhotographyHowItWorks
CategoryFAQ
PhotographyFinalCTA
CategoryRelatedCategories   ← last
```

Non-bags order: unchanged.

## Implementation

Single file: `src/pages/seo/AIProductPhotographyCategory.tsx`.

- Compute `const isBags = page.slug === 'bags';`
- Gate the four hidden sections with `{!isBags && <... />}`
- For RelatedCategories: render once, conditionally placed — `{!isBags && <CategoryRelatedCategories />}` in its current slot, and `{isBags && <CategoryRelatedCategories />}` after `PhotographyFinalCTA`.

No component internals change. No new files. No design tokens touched.

## Question (one)

On bags, do you want `CategoryRelatedCategories` to come **after** `PhotographyFinalCTA` (truly last, CTA stays as the closing pitch above it), or should it **replace** the FinalCTA's position (i.e. hide FinalCTA too)? Default in this plan: keep FinalCTA, put Related Categories after it.
