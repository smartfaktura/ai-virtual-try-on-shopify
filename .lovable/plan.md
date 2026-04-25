After comparing every Landing (`/`) section against `/home` line-by-line, the typography, spacing, eyebrows, and CTA pills are already aligned. The remaining mismatches are smaller details where Landing still leans on heavier UI (gradients, primary chips, mismatched corner radii, duplicated borders, slightly off section bands). This pass cleans those up so the main landing page reads as one continuous, calm piece — exactly like /home.

## What still doesn't match (and the fix)

### 1. HeroSection.tsx
- Mobile hero scene pills use `bg-primary` blue when active — /home uses `bg-foreground` (near-black). Switch active pill to `bg-foreground text-background` to match HomeTransformStrip pills.
- Mobile output card label badge uses `bg-primary/80` — replace with the home-style `bg-foreground/60` overlay (matches HomeHero MarqueeCard label).
- Tighten section band: change `bg-[#FAFAF8]` is fine, but remove the leftover `pt-28 pb-6 sm:pt-36 sm:pb-10` and use `pt-28 pb-6 lg:pt-36 lg:pb-10` (already matches /home — keep). No change here.

### 2. ProductCategoryShowcase.tsx
- Category label chip uses `bg-foreground/60` with white text — keep, but currently it's `text-primary-foreground` (which is white in this theme). Confirmed fine.
- Card uses `rounded-2xl` and `shadow-md shadow-foreground/[0.04]` ✓ matches HomeHero.
- The progress bar at top of each card is `bg-primary/70` blue — /home has none. Change to `bg-foreground/30` for a calmer, on-brand indicator (or remove entirely). Recommendation: keep but switch to `bg-foreground/40`.

### 3. OneImageToVisualLibrarySection.tsx
- Cells use `border border-border/40` + `shadow-[0_1px_2px...]`. /home cards use `shadow-md shadow-foreground/[0.04]` and no border. Drop the border, use the same shadow token for visual consistency.
- Source "Original" badge is `bg-primary/90` blue — /home uses `bg-primary/90` too in HomeTransformStrip GridCard, so this one is consistent. No change.
- Source ring `ring-1 ring-primary/40` — soften to `ring-1 ring-foreground/15` so it doesn't pop blue against a calm grid.

### 4. StudioTeamSection.tsx
- Member role uses `text-primary` (bright blue) — /home is monochrome. Change to `text-foreground/80` for the role line (keeps hierarchy but removes the only blue accent in the carousel).
- Card border uses `border-[#f0efed]` ✓ matches /home tokens.

### 5. HowItWorks.tsx
- Step header pattern (`Step 01` text eyebrow) ✓ matches /home.
- Step 2 demo: `Lifestyle` chip is `bg-primary text-primary-foreground` — /home equivalent demo (HomeHowItWorks StepChoose) uses `ring-2 ring-foreground/70 bg-foreground/[0.06]` style. Change the active workflow chip to `bg-foreground text-background` to match.
- Step 1 "Ready" pulse + Step 2 "Generate" Sparkles use `text-primary` blue. Soften to `text-foreground` so the calm minimalist tone holds.
- Upload icon container uses `bg-primary/10 text-primary` — switch to `bg-foreground/[0.06] text-foreground/70` to match HomeHowItWorks StepUpload.

### 6. FreestyleShowcaseSection.tsx
- Heading uses `<span className="text-primary">No limits.</span>` — /home doesn't use color accents in headings. Change span to `text-[#4a5578]` (the same muted slate used in HomeHero subhead).
- Active chips use `border-primary/40 bg-primary/10 text-primary` — calm to `border-foreground/20 bg-foreground/[0.06] text-foreground`.
- Generate button stays primary (it IS the CTA inside the demo) — keep.
- Progress bar `bg-primary` — keep (it's a transient demo signal).

### 7. VideoShowcaseSection.tsx — already matches. No change.

### 8. ModelShowcaseSection.tsx — already matches (`bg-[#FAFAF8]`, marquee, soft shadow). No change.

### 9. EnvironmentShowcaseSection.tsx — already matches. No change.

### 10. LandingFAQ.tsx — already mirrors HomeFAQ exactly. No change.

### 11. FinalCTA.tsx — already mirrors HomeFinalCTA exactly (same bg, blur orbs, white pill, outline pill). No change.

## Summary of the rule being applied
Anywhere on the landing page that still uses `text-primary` / `bg-primary` / `bg-primary/10` for **decorative** accents (not the main page-level CTA buttons), swap to neutral `foreground`-based tokens. The /home page uses primary blue **only** on the hero CTA, the FAQ heading underline, and the Generate button — nothing else. This pass brings Landing to the same discipline.

## Files to edit (6)
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/ProductCategoryShowcase.tsx`
- `src/components/landing/OneImageToVisualLibrarySection.tsx`
- `src/components/landing/StudioTeamSection.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/FreestyleShowcaseSection.tsx`

No content, no copy, no structural changes — only token-level color/border/shadow swaps to match /home's monochrome restraint.

Approve to apply?