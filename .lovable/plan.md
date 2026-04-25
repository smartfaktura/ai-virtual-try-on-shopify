## Audit findings on /ai-product-photography

The page is structurally solid, but several small inconsistencies break the "premium, seamless" feel. Here is what I found and what I will fix.

### 1. Section background rhythm is broken

Current order of section backgrounds:

```text
Hero            #FAFAF8   (warm)
CategoryChooser white     (clean)
VisualSystem    #f5f5f3   (warm)
HomeModels      #FAFAF8   ← breaks the warm/white toggle
HowItWorks      white
SceneExamples   #f5f5f3
UseCases        white
Comparison      #f5f5f3
FAQ             white
FinalCTA        #1a1a2e
```

Two warm tones (`#FAFAF8` next to `#f5f5f3`) sit back-to-back and create a muddy seam between VisualSystem and HomeModels. Fix: pass `className="bg-background"` to `HomeModels` so the alternation stays clean (warm → white → warm → white …).

### 2. Headings don't share one color token

Most H2s use `text-[#1a1a2e]`, but `HomeModels` (via `ModelsMarquee` defaults) uses `text-foreground`, which renders as a slightly different near-black. Pass an override or align to `#1a1a2e` so all section headings match.

### 3. CTA buttons aren't standardized

| Location | Height | Padding | Style |
|---|---|---|---|
| Hero primary | 3.25rem | px-8 | `bg-primary` rounded-full, shadow ✓ |
| HowItWorks primary | 3.25rem | px-8 | shadcn Button rounded-full ✓ |
| SceneExamples "Browse library" | **3rem** | **px-7** | `bg-foreground` (black) — odd shape & color |
| FinalCTA primary | 3.25rem | px-8 | `bg-white` ✓ (dark bg) |

Fix: bring the SceneExamples CTA to the same `h-[3.25rem] px-8` size and switch to a softer secondary style (outlined dark on warm bg) so it doesn't look like a different button system. Keep the primary `bg-primary` style reserved for the true conversion CTAs.

### 4. Arrow icon sizes drift

`ArrowRight size={16}` in Hero, `h-4 w-4` (=16) in HowItWorks, `size={14}` in SceneExamples, `ArrowUpRight size={12}` in CategoryChooser. Standardize:
- Inside primary CTAs: 16
- Inside secondary CTAs / inline links: 14
- Inside small card meta links (CategoryChooser cards): 14 (currently 12 looks undersized next to the label)

### 5. Card system has two different icon-chip languages

- `PhotographyVisualSystem` chips: `rounded-xl bg-primary/10 text-primary`
- `PhotographyHowItWorks` chips: `rounded-2xl bg-[#1a1a2e] text-white`

Same page, two different visual languages. Align both to a single chip style: `rounded-2xl bg-[#1a1a2e] text-white` (more premium, matches the dark FinalCTA and Comparison panel).

### 6. Card radii inconsistency

Most content cards use `rounded-3xl` (HowItWorks, VisualSystem, Comparison, FAQ, CategoryChooser ≥sm). `PhotographyUseCases` cards are `rounded-2xl`, which makes that grid look like it belongs to a different system. Promote them to `rounded-3xl` for parity, and bump padding from `p-5` to `p-6` so they breathe.

### 7. Hover transitions drift

`duration-500 hover:-translate-y-1` (Chooser, VisualSystem) vs `hover:-translate-y-0.5` with no duration (UseCases). Standardize all interactive cards to `transition-all duration-300 hover:-translate-y-1 hover:shadow-md`.

### 8. Eyebrow / heading duplication in CategoryChooser

```text
Eyebrow: "Choose your category"
H2:      "Choose your product category"
```

The eyebrow restates the H2. Replace eyebrow with `Categories · 10 product verticals` to add information instead of repeating.

Also tighten the SceneExamples eyebrow from "Scene library · 1600+ ready-to-use scenes" to the cleaner "Scene library · 1600+ scenes" so all eyebrows stay short.

### 9. Comparison X-pill is visually heavier than needed

`bg-muted` X-circle reads almost as a button. Soften to `bg-foreground/5 text-foreground/40` so the negatives feel quieter and the green Checks dominate (better for the "VOVV wins" message).

### 10. UseCases has no closing action

Every other section ends with a CTA or onward link; UseCases dead-ends. Add a small inline link under the grid: "See all 1600+ scenes →" pointing to `/product-visual-library`, using the standardized inline-link style.

---

### Files to edit

- `src/pages/seo/AIProductPhotography.tsx` — pass `className="bg-background"` to `HomeModels`.
- `src/components/home/HomeModels.tsx` — accept and forward `className`; also pass an explicit `text-[#1a1a2e]` heading override (via a small wrapper or, simpler, leave wrapper bg and rely on global token if it already resolves to `#1a1a2e`).
- `src/components/seo/photography/PhotographyCategoryChooser.tsx` — eyebrow copy, ArrowUpRight size 12 → 14.
- `src/components/seo/photography/PhotographyVisualSystem.tsx` — icon chip → dark style to match HowItWorks.
- `src/components/seo/photography/PhotographySceneExamples.tsx` — eyebrow tighten, CTA height/padding/style normalize, arrow size 14.
- `src/components/seo/photography/PhotographyUseCases.tsx` — `rounded-3xl`, `p-6`, unified hover, add closing inline link.
- `src/components/seo/photography/PhotographyComparison.tsx` — soften X pill background.

No new dependencies, no schema changes, no copy changes beyond the two eyebrow tweaks.
