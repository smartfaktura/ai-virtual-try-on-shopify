## What went wrong last time

I oversized the headlines (`text-4xl sm:text-5xl tracking-[-0.03em]`) and used `rounded-3xl` cards — which is heavier than the actual homepage. That's why the BugBounty title now wraps to "Help us make VOVV.AI / better" and the cards feel chunky. The user's reference is the real homepage scale (HomeFAQ, HomeHowItWorks).

## Correct homepage tokens (from `HomeFAQ.tsx` + `HomeHowItWorks.tsx`)

| Token | Correct value |
|---|---|
| Page bg | `bg-[#FAFAF8]` |
| Section padding | `py-16 lg:py-32` (this is too much for in-app, use `pt-16 lg:pt-20 pb-20`) |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4` |
| **Headline** | `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` (NOT `tracking-[-0.03em]`, NOT `text-5xl` on small screens) |
| Subtitle | `text-base sm:text-lg text-muted-foreground leading-relaxed mt-4` |
| Header → content gap | `mb-12 lg:mb-16` |
| **Cards** | `bg-white rounded-2xl border border-[#f0efed] shadow-sm` (NOT 3xl, NOT shadow-md) |
| Card padding | `p-5 sm:p-6` |
| Primary CTA | `rounded-full px-8 h-[3.25rem] text-base font-semibold shadow-lg shadow-primary/25` |

Plus: pages should be **left-aligned** (per user) — homepage hero is centered but FAQ/HowItWorks center the *header block only*; for in-app utility pages, the user explicitly said left-aligned, so headers stay left.

## Scope — redo all 5 pages

### 1. `src/pages/BugBounty.tsx`
- Drop the icon-tile layout next to the headline (it's competing with the eyebrow). Stack: eyebrow → headline → subtitle, left-aligned
- Headline: `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.08]` so "Help us make VOVV.AI better" fits on one or two clean lines
- Cards: `rounded-3xl` → `rounded-2xl`, padding `p-5 sm:p-6 sm:p-7` → `p-5 sm:p-6` (more uniform)
- Container: `max-w-3xl mx-auto` (re-add `mx-auto` — left-aligned within container, not full-bleed)
- CTA card: tighten copy block ("Found a bug?" gets `text-[14px] font-semibold text-foreground`), button uses `size="lg"` matching home

### 2. `src/pages/AppHelp.tsx`
- Container: `max-w-2xl mx-auto` (re-add `mx-auto`)
- Headline: drop oversize `text-4xl sm:text-5xl tracking-[-0.03em]` → `text-3xl sm:text-4xl font-semibold tracking-tight` (smaller container = smaller headline; matches HomeFAQ's `max-w-2xl` proportions)
- Add eyebrow `Support` above headline (this is just a structural label like "FAQ" / "How it works" on home — it's a section name, not new copy)
- Form/links cards: `rounded-3xl` → `rounded-2xl`, keep border + shadow-sm
- Footer social row: change from centered `justify-center` to left-aligned (consistent with rest)

### 3. `src/pages/Learn.tsx`
- Container: `max-w-3xl mx-auto`
- Headline: `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` (drop `-0.03em`)
- Video figure border: `rounded-3xl` → `rounded-2xl`
- Search: keep pill style, but use `h-11` not `h-12` (matches inputs in shadcn defaults better)
- Track section cards: `rounded-3xl` → `rounded-2xl`

### 4. `src/pages/BrandProfiles.tsx`
- The page uses `<PageHeader>` which already uses the right scale (`text-2xl sm:text-3xl font-bold tracking-tight`). Issue: PageHeader's `font-bold` doesn't match home's `font-semibold`. Solution: leave PageHeader untouched (shared component), but the off-white shell + cards still need fixing
- BrandModelsBanner: `rounded-3xl` → `rounded-2xl`, keep white bg
- Content padding: container `px-4 sm:px-6 lg:px-8 pt-24 lg:pt-10 pb-14` is fine
- CTA: keep pill, slightly less prominent (`h-11 px-6` is right)

### 5. `src/pages/Settings.tsx`
- Page uses `<PageHeader>` — leave header alone
- Cards: `rounded-3xl` → `rounded-2xl`, keep border + shadow-sm (already done)
- Monthly/Annual toggle: keep pill (correct already)
- Save button: drop oversized `h-[3.25rem] px-7 shadow-lg` (this is a save button, not a marketing CTA). Use standard `size="pill"` like before — just keep the pill rounding
- Section spacing: `space-y-8` is fine

## Common adjustments across all pages

- Replace every `rounded-3xl` (in cards I added) → `rounded-2xl`
- Replace every `tracking-[-0.03em]` → `tracking-tight`
- Replace every `text-4xl sm:text-5xl` (on headlines) → `text-3xl sm:text-4xl lg:text-5xl`
- Add `mx-auto` to all containers so they sit centered in the wide app shell but content stays left-aligned within
- Settings Save button: revert to small pill, not marketing-sized

## Files touched

- `src/pages/BugBounty.tsx`
- `src/pages/AppHelp.tsx`
- `src/pages/Learn.tsx`
- `src/pages/BrandProfiles.tsx`
- `src/pages/Settings.tsx`

No content/copy changes. No shared components touched.
