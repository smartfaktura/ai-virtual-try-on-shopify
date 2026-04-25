# Help Center Landing — Aesthetic Refresh

Restyle `/help` to match the home page's premium 2026 look. No structural changes, no new data — just visual polish and tighter rhythm.

## What changes

**File:** `src/pages/HelpCenter.tsx` (only)

### 1. Page background
- Wrap content in `bg-[#FAFAF8]` (cream, matches `Home.tsx`) instead of default background.

### 2. Hero section
- Replace pill chip + small heading with home-style hero:
  - Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` → "Help Center"
  - H1: `text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em]` → "How can we help?"
  - Sub: muted, max-w-xl → "Search answers, browse topics, or talk to a human."
- Search input: taller (`h-12`), `rounded-full`, soft border, subtle shadow, `pl-12` for icon. Matches the pill aesthetic from `SignupSlideUp` / hero CTAs.

### 3. FAQ list
- Keep accordion + categories (no data change).
- Card style mirrors `HomeFAQ`:
  - `bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md`
  - Trigger: `text-[#1a1a2e] text-[17px] font-semibold py-6`
  - Content: `text-foreground/70 text-[15px] leading-relaxed pb-6`
- Category label: small uppercase eyebrow (`text-[11px] tracking-[0.2em] text-muted-foreground`) instead of the current `text-lg` heading — quieter, more editorial.
- Increase vertical spacing between categories (`space-y-14`).

### 4. "Still need help?" → Final dark CTA
- Replace muted gray box with home-style dark CTA section, mirroring `HomeFinalCTA`:
  - `bg-[#1a1a2e]` full-width section with soft blurred blobs
  - Eyebrow "Still stuck?", H2 "Talk to a human", muted sub
  - Two pill buttons: white "Contact support" (→ `/contact`) + outlined "Join Discord" (→ existing Discord link)

### 5. Empty search state
- Center, more breathing room, same muted tone — minor polish only.

## Out of scope
- No new sections, no new images, no data edits, no copy rewrite beyond the hero/CTA microcopy above.
- No changes to `faqContent.ts`, `PageLayout`, or nav/footer.

## Visual reference
Aesthetic tokens borrowed verbatim from `HomeHero`, `HomeFAQ`, `HomeFinalCTA` so the page feels native to the home flow.
