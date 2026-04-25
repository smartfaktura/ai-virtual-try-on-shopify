## In-depth diff of `/` vs `/home`

After a section-by-section comparison, most of the page now matches the `/home` aesthetic. The remaining inconsistencies are concrete and small. Here is exactly what is still off and how to fix it.

### Issues found

**1. HeroSection — leftover primary-blue accents**
- Mobile bottom strip shows `text-primary` for "∞ results" and `ArrowRight text-primary` (lines ~373–374). `/home`'s hero uses neutral foreground tones throughout.
- Mobile dot indicator active state uses `bg-primary` (line ~345). `/home` marquee has no primary accents.
- "Original" badge on the marquee equivalent in `HomeHero` uses `bg-primary/90` — but the rest of the home page is neutral. We should keep these in sync; for restraint, swap to `bg-foreground/80 text-background`.

**2. OneImageToVisualLibrarySection — primary "Original" badge**
- Source-cell "Original" badge uses `bg-primary/90 text-primary-foreground` (line 214). Should be `bg-foreground/80 text-background` to match the calm neutral system used elsewhere.

**3. HowItWorks — Step 1 "drag & drop" border still uses default `border-border` solid look but lacks `/home`'s rounded radius scale**
- Step 1 inner upload zone uses `rounded-2xl` and `border-2 border-dashed border-border` — `HomeHowItWorks` uses `border-border/70` (softer). Minor: soften the dashed border to `border-border/70` for the lighter look.
- The "Ready" pill is fine (already neutral foreground). No change.

**4. ProductCategoryShowcase — category label uses `text-primary-foreground` ambiguously**
- Line 82: `text-primary-foreground bg-foreground/60` works but the token mismatch (`primary-foreground` on a `foreground` background) is sloppy. Replace with `text-background bg-foreground/60` for semantic correctness. (Visual is identical — this is a token cleanup.)

**5. HomeFinalCTA vs FinalCTA — fully aligned ✅** (matching dark navy, same blur orbs, same eyebrow style). No changes needed.

**6. LandingFAQ vs HomeFAQ — fully aligned ✅** (same bg, accordion styling, eyebrow).

**7. ModelShowcase / EnvironmentShowcase / VideoShowcase — aligned ✅** (consistent eyebrow, h2, py-16 lg:py-32, max-w-[1400px], rounded-2xl shadow tokens).

**8. StudioTeamSection — aligned ✅** (matches HomeCreateCards card styling: `rounded-3xl`, `border-[#f0efed]`, `shadow-sm`, hover `-translate-y-1`).

**9. FreestyleShowcaseSection — aligned ✅** after prior pass (neutral chips, `#4a5578` slate accent).

### Changes to apply

1. **`src/components/landing/HeroSection.tsx`**
   - Mobile bottom strip (~line 373–374): change `text-primary` "∞ results" + arrow to `text-foreground`.
   - Mobile dot indicator (~line 345): change active dot from `bg-primary` to `bg-foreground`.

2. **`src/components/landing/OneImageToVisualLibrarySection.tsx`**
   - Line 214: replace `bg-primary/90 text-primary-foreground` with `bg-foreground/80 text-background`.

3. **`src/components/landing/HowItWorks.tsx`**
   - Line 153: soften dashed border to `border-border/70`.

4. **`src/components/landing/ProductCategoryShowcase.tsx`**
   - Line 82: replace `text-primary-foreground` with `text-background` (token correctness, identical visual).

5. **`src/components/home/HomeHero.tsx`** (optional, for full symmetry)
   - Line 64: "Original" badge — change `bg-primary/90 text-primary-foreground` to `bg-foreground/80 text-background` so both pages use the same neutral badge style.

That's it — these are the last remaining mismatches. After this, both pages will share an identical design language.

**Approve to apply these 5 small refinements?**