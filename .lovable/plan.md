

# Fix Model Selector: Show All Models with Clear Sections

## What's Wrong

The "Visible Person Styling" model picker renders brand models and library models in a single flat grid with no visual distinction. When the user has only a couple of brand models, it looks like only brand models are available. There's no section labeling to distinguish "Your Brand Models" from "Library Models."

## What Works Fine (No Changes Needed)

- **All Refine buttons work correctly** — chips toggle on click, values feed into the prompt builder
- **"Do nothing" behavior is correct** — Auto defaults are pre-applied in `INITIAL_DETAILS`, and the prompt builder's `isAuto()` correctly skips undefined/empty values while using the pre-set defaults (soft-diffused lighting, natural shadow, etc.)
- **Both model arrays are passed** — `userModels` and `globalModels` are both wired from `ProductImages.tsx`

## Plan

### Update model grid in `ProductImagesStep3Refine.tsx` (lines 640-657)

Replace the flat model grid with sectioned layout matching the pattern used in `CatalogStepModelsV2.tsx`:

1. **"Your Brand Models" section** — show user models with a Crown icon header. If empty, show a CTA to create a brand model (link to `/app/brand-models`)
2. **"Library Models" section** — show global/library models with a separate header
3. **"No Model" option** — add a "Skip — use manual styling" chip above the grid so users can explicitly opt out of model selection (currently this is implicit but not obvious)
4. Add a gender filter (All / Women / Men tabs) like `CatalogStepModelsV2` does, to help users find models quickly when the library is large

### File changes

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Replace flat model grid (lines 643-657) with sectioned layout: Brand Models section with Crown header + empty CTA, Library Models section with label, gender filter tabs, and explicit "No model" toggle |

### Technical details

- Reuse `ModelSelectorCard` component (already imported)
- Add gender filter state: `useState<'all' | 'female' | 'male'>('all')`
- Filter models with `.filter(m => genderFilter === 'all' || m.gender === genderFilter)`
- Brand section: Crown icon + "Your Brand Models" label, same pattern as `CatalogStepModelsV2`
- Library section: plain label "Library Models"
- Empty brand state: dashed border card with Plus icon linking to `/app/brand-models`
- Keep the existing manual styling chips (Presentation, Age Range, etc.) visible when no model is selected — this already works correctly

