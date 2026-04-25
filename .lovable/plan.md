
# Restyle every section on `/` to match the `/home` aesthetic

You're right — the previous plan grouped sections together. This one covers **every** block rendered on `/` (main landing) individually. Goal: keep all current sections, copy, animations, and links — only swap visual styling so the page feels like the refined `/home` page.

## The shared `/home` design tokens (applied everywhere below)

- **Section rhythm:** `py-16 lg:py-32`. Container: `max-w-[1400px] mx-auto px-6 lg:px-10` (FAQ stays narrower at `max-w-2xl mx-auto px-6`).
- **Eyebrow:** `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4` (white/50 on dark band).
- **Heading:** `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` (replace every `font-bold`).
- **Subcopy:** `text-base sm:text-lg leading-relaxed text-muted-foreground`.
- **Header block wrapper:** `text-center max-w-2xl mx-auto mb-12 lg:mb-16`.
- **Cards:** `bg-white rounded-3xl shadow-sm border border-[#f0efed]`. Tile thumbnails: `rounded-2xl shadow-md shadow-foreground/[0.04]`.
- **Primary CTA:** `Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold shadow-lg shadow-primary/25"` + small `text-xs text-muted-foreground` reassurance line beneath.
- **Secondary CTA:** same shape, `border border-border` outline.
- **Dark band style:** `bg-[#1a1a2e]` with white/5 cards and `border border-white/10`.
- **FAQ list style:** `bg-[#f5f5f3]` page band, `bg-white rounded-2xl border-[#f0efed] px-6 shadow-sm` items.
- **Remove all `<Badge>` eyebrows** above headings — replace with the plain text eyebrow.

## Sections on `/` — every single one (in render order)

### 1. `LandingNav` — *no change*
Shared component used elsewhere. Skip.

### 2. `src/components/landing/HeroSection.tsx`
- Section: `pt-28 pb-20 sm:pt-36 sm:pb-28` → `pt-28 pb-6 lg:pt-36 lg:pb-10` on `bg-[#FAFAF8]`. Drop the gradient overlay + `bg-primary/8 blur-3xl` blob.
- H1: keep typewriter; tighten with `tracking-[-0.03em]` and replace primary-tinted typed text color with the `/home` `text-[#4a5578]` accent for the rotating phrase.
- Subcopy: keep both desktop/mobile lines, restyle to `text-lg leading-relaxed text-muted-foreground`.
- CTAs: rebuild "Try It On My Product" / "See Real Examples" as `h-[3.25rem] px-8 rounded-full` pair (filled primary + outline border). Behavior identical (`navigate(user ? '/app/workflows' : '/auth')`, `Link to="/discover"`).
- Trust badges row → replace with single line `20 free credits · No credit card required · Start in seconds` styled as `text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8`.
- Showcase carousel: keep all logic, only restyle wrappers — `rounded-2xl` (was `rounded-xl`), `shadow-sm shadow-foreground/[0.04]`, label badges to gradient-bottom strip pattern from `HomeHero`. Scene pill buttons → match `HomeTransformStrip` pill style (active `bg-foreground text-background`, idle `bg-muted/60 text-muted-foreground border border-border/60`).

### 3. `src/components/landing/ProductCategoryShowcase.tsx`
- Section: `py-16 lg:py-24` → `py-16 lg:py-32`. Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Header: drop `<Badge>Every Category</Badge>`; replace with text eyebrow. H2 → `font-semibold tracking-tight` (was `font-bold`). Subcopy weight unchanged.
- Cards: `rounded-xl border border-border/40` → `rounded-2xl border-0 shadow-md shadow-foreground/[0.04]`. Category label chip: change `bg-foreground/60` chip to `text-[10px] font-semibold uppercase tracking-wider bg-foreground/60 text-white px-2 py-0.5 rounded-full` and move into the gradient-bottom strip pattern.
- CTA: button `px-8 py-5` → standard `h-[3.25rem] px-8` + add `text-xs text-muted-foreground` reassurance line beneath.

### 4. `src/components/landing/OneImageToVisualLibrarySection.tsx`
- Section: `py-24 md:py-32` → `py-16 lg:py-32`. Drop the `bg-gradient-to-b from-background via-primary/[0.02]` overlay (set plain `bg-background`).
- Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Eyebrow: `text-xs uppercase tracking-[0.2em] mb-5` → `text-[11px] font-semibold uppercase tracking-[0.2em] mb-4`.
- H2: keep size, already `font-semibold` ✓ — just normalize to the canonical class (`text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight`).
- Subcopy size unchanged; standardize to `text-base sm:text-lg leading-relaxed`.
- CTA: `px-8 py-6` → `h-[3.25rem] px-8`. Reassurance microcopy stays.
- Grid cells: `rounded-2xl border border-border/40 bg-muted/30` → `rounded-2xl shadow-md shadow-foreground/[0.04] bg-[#efece8]` (matches `HomeTransformStrip` tile shell). Keep "Original" pill.

### 5. `src/components/landing/StudioTeamSection.tsx`
- Section: `py-20 sm:py-28 bg-muted/30` → `py-16 lg:py-32 bg-background`. Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Header: remove `<Badge>` and the duplicate H2 (`Your AI Creative Studio` shown twice). Use eyebrow `Your AI Creative Studio` + single H2 `10 specialists. Zero overhead.` + existing subcopy. H2 → `font-semibold tracking-tight` (was `font-bold`).
- Card outer: `rounded-2xl border border-border` → `rounded-3xl border border-[#f0efed] shadow-sm`. Hover lift unchanged.
- Member name → `font-semibold` (not `font-bold`). Expertise `<Badge>` → `text-[10px] uppercase tracking-wider text-muted-foreground`.
- CTA: `px-8 py-6` → `h-[3.25rem] px-8` + reassurance line beneath ("Meet the full team").

### 6. `src/components/landing/HowItWorks.tsx`
- Section: `py-20 sm:py-28 bg-muted/20` → `py-16 lg:py-32 bg-background`. Container `max-w-7xl` → `max-w-[1400px]`.
- Header: add eyebrow `How it works`. H2 → `font-semibold tracking-tight` (was `font-bold`).
- Step number badge: `w-8 h-8 rounded-full bg-primary` → text-only `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` chip (matches `HomeHowItWorks` "1. Upload" pattern). Step title → `text-lg font-semibold` (currently `text-2xl font-bold`).
- Mockup outer cards: `rounded-2xl border border-border` → `rounded-3xl border border-[#f0efed] shadow-sm shadow-foreground/[0.04]`. Inner sub-cards keep current borders (just tone to `border-[#f0efed]`).
- Platform chips (Shopify/Wix/etc.) → keep as-is (already small pills).
- CTA: `px-8 py-6` → `h-[3.25rem] px-8` + reassurance line beneath.

### 7. `src/components/landing/FreestyleShowcaseSection.tsx`
- Section: `py-12 md:py-28 bg-[hsl(30,20%,98%)]` → `py-16 lg:py-32 bg-[#FAFAF8]`. Drop the `bg-primary/[0.04] blur-3xl` orb.
- Container `max-w-4xl` → keep the narrow width but switch to the canonical `mx-auto px-6 lg:px-10`.
- Header: replace the primary-tinted "Freestyle Studio" pill with the standard eyebrow `Freestyle Studio`. H2 → `font-semibold tracking-tight` (was `font-bold`); accent span keeps `text-primary`.
- Demo panel: outer `rounded-2xl border border-border/60 bg-card shadow-xl` → `rounded-3xl border border-[#f0efed] bg-white shadow-sm shadow-foreground/[0.04]`. Internal chip styles, animation, and progress bar untouched.
- Result cards: `rounded-xl border border-border/50` → `rounded-2xl border border-[#f0efed] shadow-sm`.
- CTA: `px-8 py-6` → `h-[3.25rem] px-8` + small reassurance line.

### 8. `src/components/landing/VideoShowcaseSection.tsx`
- Section: `py-20 lg:py-28` → `py-16 lg:py-32`. Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Header: add eyebrow `Video`. H2 already `font-semibold tracking-tight` ✓. Subcopy class unchanged.
- Video tiles: `rounded-lg` → `rounded-2xl shadow-md shadow-foreground/[0.04]`, gap `gap-1` → `gap-3 lg:gap-4`.
- CTA: `px-10 py-6 shadow-xl` → standard `h-[3.25rem] px-8 shadow-lg shadow-primary/25` + reassurance line.

### 9. `src/components/landing/ModelShowcaseSection.tsx`
- Section: `py-20 lg:py-24 bg-muted/30` → `py-16 lg:py-32 bg-[#FAFAF8]`. Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Header: drop `<Badge>{count}+ AI Models</Badge>`; replace with eyebrow `${count}+ AI Models`. H2 → `font-semibold tracking-tight` (was `font-bold`).
- Model cards: `rounded-xl border border-border` → `rounded-2xl shadow-md shadow-foreground/[0.04] border-0`. Marquee fade gradients re-tinted to match the new section background (`#FAFAF8`).
- Model name label: `text-xs sm:text-sm font-medium` → `text-[11px] tracking-wide text-muted-foreground` to match `HomeHero` marquee labels.
- No CTA currently — leave as-is (matches `/home` marquee usage).

### 10. `src/components/landing/EnvironmentShowcaseSection.tsx`
- Section: `py-12 lg:py-16` → `py-16 lg:py-32 bg-background`. Container `max-w-7xl` → `max-w-[1400px] … px-6 lg:px-10`.
- Header: drop `<Badge>30+ Scenes</Badge>`; replace with eyebrow `30+ scenes`. H2 → `font-semibold tracking-tight` (was `font-bold`).
- Environment cards: `rounded-xl border border-border` → `rounded-2xl shadow-md shadow-foreground/[0.04] border-0`. Label `text-xs sm:text-sm font-medium` → `text-[11px] tracking-wide text-muted-foreground`.
- No CTA — leave as-is.

### 11. `src/components/landing/LandingFAQ.tsx`
- Section: `py-20 sm:py-28 bg-muted/20` → `py-16 lg:py-32 bg-[#f5f5f3]`. Container `max-w-3xl` → `max-w-2xl mx-auto px-6` (matches `HomeFAQ`).
- Header: add eyebrow `FAQ`. H2 → `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1a1a2e]` (was `text-3xl sm:text-4xl font-bold`). Add subcopy line `Quick answers before you commit`.
- Accordion items: `border border-border rounded-xl px-5 bg-card` → `bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow`. List spacing `space-y-2` → `space-y-3`.
- Trigger: `text-sm font-semibold py-4` → `text-base sm:text-[17px] font-semibold py-6 hover:no-underline text-left text-[#1a1a2e]`.
- Content: `text-sm text-muted-foreground` → `text-foreground/70 text-[15px] sm:text-base leading-relaxed pb-6`.
- JSON-LD untouched.

### 12. `src/components/landing/FinalCTA.tsx`
- Replace gradient/glow background with `HomeFinalCTA` treatment: `py-16 lg:py-32 bg-[#1a1a2e]` plus the two soft slate orbs (`#475569` and `#64748b` at 10% opacity).
- Drop the `Sparkles` pill; use eyebrow `Get started` (`text-white/50`).
- H2 → `text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight`. Subcopy → `text-[#9ca3af] text-base sm:text-lg leading-relaxed`.
- CTAs: pair of pills — primary `bg-white text-[#1a1a2e]` and secondary `border border-white/20 text-white` (`/auth` and `/discover`), both `h-[3.25rem] px-8`. Replace the three `Free to try / No prompts / Cancel anytime` icon row with the same caption pattern as `HomeFinalCTA`.
- Team avatars row: keep, restyle caption to `text-[#9ca3af] text-sm`.

### 13. `LandingFooter` — *no change*
Shared component. Skip.

### 14. `src/pages/Landing.tsx` — *no structural change*
Render order untouched. Wrapper background stays `bg-background` so the new `bg-[#FAFAF8]`, `bg-[#1a1a2e]`, and `bg-[#f5f5f3]` bands read as intentional.

## Out of scope
- No copy or content rewrites.
- No section removals, additions, or reordering.
- No nav/footer changes.
- No route, data, hook, or animation logic changes.
- Loading/spinner standardization from earlier requests is unrelated.

## Risk
Low and visual-only. Every change is className/wrapper level inside files used **only on `/`**. Carousels, video players, intersection observers, typewriter, and onClick targets are preserved byte-for-byte.

**Approve to apply the full restyle across all 11 visual sections on `/`?**
