

# Brand Models — Hair Styles, Badge Fix & Improvements

## Changes

### 1. Gender-Aware Hair Styles
When gender changes, update the hair style options dynamically:
- **Female**: Long straight, Long curly, Medium wavy, Short straight, Short curly, Bob, Braids, Ponytail, Bun, Pixie cut
- **Male**: Short straight, Short curly, Buzz cut, Crew cut, Fade, Slicked back, Medium wavy, Bald, Afro, Man bun
- Reset `hairStyle` to `''` when gender changes so stale selections don't persist

### 2. Freestyle ModelSelectorChip — Move "BRAND MODEL" badge inside image
Currently the badge text sits below the image in a separate `<div>`, taking up vertical space. Move it to an **overlay badge inside the image** (bottom-left, small semi-transparent pill) and remove the extra text line below. This keeps model cards compact and consistent.

```
Before:                    After:
┌──────────┐              ┌──────────┐
│  [image] │              │  [image] │
├──────────┤              │ ⌜BRAND⌝  │ ← overlay badge
│  Name    │              ├──────────┤
│BRAND MOD │              │  Name    │
└──────────┘              └──────────┘
```

### 3. Improvement Ideas (for future consideration)
Not implementing now, but noting these for the user:
- **Model variations**: Generate 3 options per creation and let user pick the best
- **Model consistency test**: Preview the model in 2-3 poses before saving
- **Model gallery sharing**: Share brand models across team members
- **Favorite/pin models**: Pin frequently used models to the top of selectors

## Files Changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | Gender-aware hair style lists, reset hair on gender change |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Move "BRAND MODEL" badge from below image to overlay inside image |

