## Goal

Bring `/faq` up to the same editorial vibe as `/` and `/how-it-works`: matching hero with two-tone H1, refined section structure with eyebrow + accent-colored heading per group, and a dark final CTA matching the homepage's `HomeFinalCTA`.

## Pattern reference

From `HomeHero` / `HowItWorksHero`:
- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`
- H1: large, semibold, `tracking-[-0.03em]`, with second line wrapped in `<span className="text-[#4a5578]">` for the soft purple-grey accent
- Hero spacing: `pt-28 pb-16 lg:pt-36 lg:pb-24`

From `HomeFinalCTA`:
- Dark `#1a1a2e` background, blurred radial highlights, white H2, two pill CTAs

## Changes

### 1. `src/components/faq/FAQHero.tsx`
- Switch hero spacing to the editorial `pt-28 pb-16 lg:pt-36 lg:pb-24`
- Two-line H1 with accent span:
  - Line 1: "Everything you wanted"
  - Line 2: `<span className="text-[#4a5578]">to ask, answered.</span>`
- Use semantic `text-foreground` / `text-muted-foreground` instead of hardcoded hex

### 2. `src/components/faq/FAQAccordion.tsx`
For each group, replace the lone uppercase label with the homepage section header pattern:
- Eyebrow: `Section` label (e.g. "Getting started" stays as eyebrow text, or use a fixed eyebrow like "FAQ")
- H2 directly under it, in accent color, e.g. `<span className="text-[#4a5578]">Getting started.</span>`
- Slightly more vertical rhythm between groups (`space-y-16 lg:space-y-24`)
- Cards: keep current rounded-2xl white cards but add `transition-shadow hover:shadow-sm`
- Swap hardcoded `#1a1a2e` / `#6b7280` for `text-foreground` / `text-muted-foreground`

To keep the eyebrow meaningful, use the group's domain as the eyebrow word and reuse the title as the H2 — e.g. eyebrow `"01 · Getting started"` (or simply repeat for clarity since it's a small accent label). Final design: eyebrow shows the group name in muted small caps, H2 below in accent purple-grey for visual hierarchy that matches the home pages.

### 3. Replace `FAQContactStrip` with a dark final-section CTA
Rewrite `src/components/faq/FAQContactStrip.tsx` to mirror `HomeFinalCTA` styling:
- `bg-[#1a1a2e]` full-width section with subtle blurred orbs
- Eyebrow `Still here?`
- H2 white: "Still have questions?"
- Subcopy: "Try VOVV with 20 free credits, or get in touch — we usually reply within a day."
- CTAs: white pill `Start free` → `/auth`, outlined white pill `Contact us` → `/contact`

This becomes the final section of the page, matching how `HomeFinalCTA` closes both `/` and `/how-it-works`.

## Files to edit

- `src/components/faq/FAQHero.tsx` — two-tone H1, refined spacing/tokens
- `src/components/faq/FAQAccordion.tsx` — eyebrow + accent H2 per group, refined cards
- `src/components/faq/FAQContactStrip.tsx` — replace card layout with dark final CTA section

No changes to `src/pages/FAQ.tsx` (component composition stays identical).

## Out of scope

- FAQ content/copy unchanged
- Accordion behavior unchanged
- No new routes or navigation changes
