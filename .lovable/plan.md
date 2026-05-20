## Scope
Bags page only (`/ai-product-photography/bags`). Other category pages unchanged.

## Changes

Hide on bags:
- `CategoryUseCases` ("Built for bags teams shipping every week")
- `CategoryPainPoints` ("Why this category is hard / What makes bags visuals difficult")

Reorder on bags: `CategoryRelatedCategories` ("Related product photography categories") moved to the very last section, after `PhotographyFinalCTA`.

## Resulting bags order

```
Breadcrumbs
Hero
CategoryBuiltForEveryCategory
CategoryFeedShowcase
CategoryVisualOutputs
CategorySceneExamples
PhotographyHowItWorks
CategoryFAQ
PhotographyFinalCTA
CategoryRelatedCategories   ← last
```

Non-bags pages: unchanged.

## Implementation

Single file: `src/pages/seo/AIProductPhotographyCategory.tsx`.
- `const isBags = page.slug === 'bags';`
- Wrap `CategoryPainPoints` and `CategoryUseCases` with `{!isBags && ...}`.
- Render `CategoryRelatedCategories` in its current slot with `{!isBags && ...}`, and add a second mount `{isBags && <CategoryRelatedCategories page={page} />}` after `PhotographyFinalCTA`.

No component internals change. No new files. No design tokens touched.
