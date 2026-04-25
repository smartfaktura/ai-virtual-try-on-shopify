## Polish all 10 /ai-product-photography/{slug} category pages

All 10 category pages share one component set, so each fix lands across all 10 pages at once. Same class of inconsistencies as the parent hub, plus a few unique to category pages. **Eyebrow position stays untouched per request.**

### 1. Section background rhythm collapses in the bottom half

Current order:

```text
Hero               #FAFAF8   warm
BuiltForEvery      white
VisualOutputs      #f5f5f3   warm
PainPoints         white
SceneExamples      #FAFAF8   ← uses hero tone, breaks the warm pattern
HowItWorks         white
UseCases           white     ← two whites
RelatedCategories  white     ← three whites
FAQ                white     ← four whites in a row
FinalCTA           dark
```

Fix:
- `CategorySceneExamples` → `bg-[#f5f5f3]` (matches the rest of the warm sections)
- `CategoryUseCases` → `bg-[#f5f5f3]`

Final rhythm: `FAFAF8 → white → f5f5f3 → white → f5f5f3 → white → f5f5f3 → white → white → dark`. The trailing double-white (Related + FAQ) reads as a calm denser end before the dark CTA.

### 2. SceneExamples CTA is a different button system

Current: `h-[3rem] px-7 bg-foreground text-background text-sm` with `ArrowRight size={14}`.

Standardize to the secondary CTA used on the parent hub:
`h-[3.25rem] px-8 rounded-full border border-[#1a1a2e]/15 bg-white text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-colors`, arrow `size={16}`.

### 3. VisualOutputs cards use the wrong icon-chip language

Current: `w-10 h-10 rounded-xl bg-primary/10 text-primary` + `hover:-translate-y-0.5` (no duration).

Match the unified dark chip used elsewhere on the page (PainPoints, HowItWorks):
`w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white shadow-sm`. Hover → `transition-all duration-300 hover:-translate-y-1 hover:shadow-md`.

### 4. UseCases cards are an outlier

Current: `rounded-2xl p-5`, no icon chip (just a colored icon), `hover:-translate-y-0.5`. Doesn't match PainPoints / VisualOutputs cards on the same page.

Align: `rounded-3xl p-6` + dark chip (`w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white`) + `transition-all duration-300 hover:-translate-y-1 hover:shadow-md`. Same treatment applied on the parent hub's UseCases.

### 5. PainPoints number-pill is a different size/radius

Current: `w-9 h-9 rounded-xl`. Bring to standard chip dims: `w-10 h-10 rounded-2xl` (still keeps the mono numeral inside).

### 6. RelatedCategories card hover and arrow drift

Current: `transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`, `ArrowUpRight size={12}`, H3 uses `text-foreground`.

Align to standardized:
- `transition-all duration-300 hover:-translate-y-1 hover:shadow-md`
- `ArrowUpRight size={14}`
- H3 → `text-[#1a1a2e]`

### 7. Heading color token drift

Some sections use `text-[#1a1a2e]`, others use `text-foreground` (Hero H1, BuiltForEvery H2, RelatedCategories H2). Standardize all H1/H2 to `text-[#1a1a2e]`. The H1 highlight `<span>` (`text-[#4a5578]`) stays as-is.

### 8. Hero CTAs use `px-7`

Parent hub and HowItWorks CTAs all use `px-8`. Bump CategoryHero CTAs to `px-8` so buttons measure identically across the whole product photography surface. (Eyebrow position untouched.)

### 9. RelatedCategories inline links use `text-primary`

Convention on the parent hub is dark inline links (`text-[#1a1a2e]`). Switch the "All AI product photography categories" link and the per-card "Explore {name}" inline link to dark.

---

### Files to edit (all under `src/components/seo/photography/category/`)

- `CategoryHero.tsx` — H1 → `text-[#1a1a2e]`; CTAs `px-7` → `px-8`. Eyebrow position unchanged.
- `CategoryBuiltForEveryCategory.tsx` — H2 → `text-[#1a1a2e]`.
- `CategoryVisualOutputs.tsx` — dark icon chip; hover normalize.
- `CategoryPainPoints.tsx` — number pill `w-10 h-10 rounded-2xl`.
- `CategorySceneExamples.tsx` — bg `#f5f5f3`; standardized secondary CTA.
- `CategoryUseCases.tsx` — bg `#f5f5f3`; rounded-3xl, p-6, dark chip, hover normalize.
- `CategoryRelatedCategories.tsx` — H2/H3 → `text-[#1a1a2e]`; hover `duration-300 hover:shadow-md`; arrow size 14; inline links `text-[#1a1a2e]`.

No data, route, or schema changes. No new dependencies. All 10 category pages inherit the fixes automatically.
