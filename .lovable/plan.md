## Home page design audit

I walked every section in render order: `Hero → TransformStrip → Models → CreateCards → HowItWorks → WhySwitch → OnBrand → Environments → FAQ → FinalCTA → Footer`. The page is mostly cohesive but several subtle inconsistencies break the "pixel perfect" rhythm.

### Inconsistencies found

**1. Background banding is not deliberate**

Sections currently alternate inconsistently:
```
Hero            #FAFAF8
TransformStrip  bg-background (white)
Models          (no wrapper — inherits #FAFAF8 from page)
CreateCards     (no bg — inherits #FAFAF8)
HowItWorks      bg-background (white)
WhySwitch       #1a1a2e (dark)
OnBrand         (no bg — inherits #FAFAF8)
Environments    bg-background (white)
FAQ             #f5f5f3   ← third off-white shade, doesn't match
FinalCTA dark   #1a1a2e
FinalCTA light  #FAFAF8
```
Two issues: (a) FAQ uses a third grey `#f5f5f3` that doesn't appear anywhere else; (b) two adjacent `#FAFAF8` sections (Models + CreateCards, OnBrand alone after dark WhySwitch) blur into one another with no separator.

**Fix:** Standardize to two surfaces only — `#FAFAF8` (off-white) and `bg-background` (white) — and enforce strict alternation: off-white → white → off-white. Change FAQ from `#f5f5f3` → `#FAFAF8`. Add `bg-background` wrapper to either Models or CreateCards so they don't fuse.

**2. Section header eyebrow margins inconsistent**

- Most sections: `mb-12 lg:mb-16` ✓
- TransformStrip: `mb-10 lg:mb-12` ✗ (tighter)
- FAQ: `mb-12` (no lg variant) ✗
- Hero/Environments/Models eyebrows use a different tracking `tracking-[0.12em]` instead of the standard `tracking-[0.2em]`.

**Fix:** Standardize header block to `mb-12 lg:mb-16` everywhere a sub-section header exists. Standardize eyebrow tracking to `tracking-[0.2em]` (the dominant value used by 7 of 10 sections).

**3. Container max-widths drift**

- `max-w-[1400px]`: TransformStrip, CreateCards, WhySwitch, OnBrand, FinalCTA-light ✓
- `max-w-[1200px]`: HowItWorks (narrower for no clear reason)
- `max-w-2xl`: FAQ, FinalCTA-dark ✓ (intentional — narrative)
- `max-w-3xl`: Hero ✓ (intentional — hero copy)

**Fix:** Bump HowItWorks to `max-w-[1400px]` to match the dominant grid width. Keep narrative widths (`2xl`/`3xl`) as-is.

**4. Hardcoded hex colors instead of tokens**

Repeated literals: `text-[#1a1a2e]`, `text-[#6b7280]`, `text-[#9ca3af]`, `bg-[#FAFAF8]`. These are the same tokens already in the theme (`text-foreground`, `text-muted-foreground`, `bg-muted/secondary`).

**Fix:** Migrate `text-[#1a1a2e]` → `text-foreground`, `text-[#6b7280]` → `text-muted-foreground` across CreateCards, OnBrand, FAQ, FinalCTA. Keep dark-section overrides (`#9ca3af`, `white/50`) literal since they sit on the navy `#1a1a2e` band.

**5. Section vertical rhythm**

Standard is `py-16 lg:py-32` ✓ across most sections. Exceptions:
- Hero: `pt-28 pb-6 lg:pt-36 lg:pb-10` (intentional — first section, tight to TransformStrip)
- FinalCTA-light bridge: `py-8` (intentional — bridge band)

These are correct. No change.

**6. CTA button height**

All CTAs use `h-[3.25rem]` ✓ — already consistent.

**7. H2 typography**

All sub-section H2s: `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` ✓ — consistent.

### Summary of changes (5 small edits)

| File | Change |
|---|---|
| `HomeFAQ.tsx` | `bg-[#f5f5f3]` → `bg-[#FAFAF8]`; header `mb-12` → `mb-12 lg:mb-16`; migrate hardcoded hex to `text-foreground` |
| `HomeTransformStrip.tsx` | header `mb-10 lg:mb-12` → `mb-12 lg:mb-16`; eyebrow already correct |
| `HomeHowItWorks.tsx` | container `max-w-[1200px]` → `max-w-[1400px]` |
| `HomeCreateCards.tsx` | wrap in `bg-background` so it alternates against Models (`#FAFAF8`); migrate `text-[#1a1a2e]/[#6b7280]` → tokens |
| `HomeEnvironments.tsx` + `HomeHero.tsx` | eyebrow tracking `tracking-[0.12em]` → `tracking-[0.2em]` for the standalone meta lines |
| `HomeOnBrand.tsx` / `HomeFinalCTA.tsx` | migrate hardcoded `#1a1a2e`/`#6b7280`/`#475569` body text to tokens where they sit on light surfaces |

Result: clean alternating off-white ↔ white bands broken twice by the navy WhySwitch and FinalCTA crescendos, unified eyebrow tracking, single header rhythm, single container width, theme tokens everywhere on light surfaces.

### Out of scope

- No copy changes, no component restructuring, no image/marquee adjustments.
- Dark `#1a1a2e` sections keep their hardcoded text colors (designed against the navy surface).
- No mobile breakpoint changes beyond the rhythm fixes above.
