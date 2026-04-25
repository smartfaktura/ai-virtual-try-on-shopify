# Public Landing Refresh — About, Careers, Press, Team

Restyle four pages to match the home page's premium 2026 aesthetic (cream `#FAFAF8` canvas, editorial type rhythm, white rounded cards with subtle borders, dark `#1a1a2e` final CTA). Same approach as the recent Help Center refresh — no structural changes, no new data, just visual polish + tighter copy where it cleans things up.

## Shared design tokens (applied to all four pages)

- Page background: `bg-[#FAFAF8]`
- Hero pattern: small uppercase eyebrow (`text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`) → big tracking-tight headline (`text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em]`) → muted lead paragraph
- Cards: `bg-white rounded-2xl border border-[#f0efed] shadow-sm`
- Section dividers: alternate cream `#FAFAF8` and very soft `#f5f5f3`, no harsh borders
- Buttons: `rounded-full h-[3.25rem] px-8` — primary filled or outlined
- Drop the small pill chips with icons (`bg-primary/10 text-primary`) — replaced by uppercase eyebrows
- Drop generic gradient backgrounds, decorative `w-12 h-px` lines, and `Card` shadcn wrappers in favor of the home's flatter white-card style
- Final dark CTA section per page (mirrors `HomeFinalCTA`), tailored copy per page

---

## 1. `src/pages/About.tsx`

- Hero: cream bg, eyebrow "About VOVV.AI", headline kept ("Studio-quality product photography, powered by AI"), muted lead. Remove pill chip + thin divider line.
- "The Problem / Our Approach": keep two-column grid, but render as two white rounded cards on cream, with small uppercase eyebrows above each title.
- Founder block: keep portrait + quote layout. Convert outer card to `bg-white rounded-3xl border border-[#f0efed] shadow-sm`. Keep blockquote left border accent (use `border-primary/40`).
- Values grid: replace shadcn `Card` with bare white rounded cards; tighter typography matching home cards. Eyebrow "What drives us" + `text-3xl sm:text-4xl` headline.
- AI Team avatars: keep grid, soft cream section, eyebrow "The AI team", same hover behavior.
- New final dark CTA: "Start with one product photo" → `Try free` (white pill) + `See examples` (outlined).

## 2. `src/pages/Careers.tsx`

- Hero: cream, eyebrow "Careers", headline kept, muted lead.
- Culture: white rounded cards on cream (replace shadcn `Card`), eyebrow "Why VOVV", larger headline, 3-up grid.
- Open positions: convert each role to a clean white rounded row card with role title + role meta as small text (drop badge clutter — show team · location · type as a single muted line). Hover: subtle border tint, no heavy shadow. "Apply" as outlined pill.
- "Don't see your role?" → keep but as a subtle white rounded card, not muted gray box.
- Final dark CTA: "Build with us" → `See open roles` (jumps to #positions) + `Email us` (outlined).

## 3. `src/pages/Press.tsx`

- Hero: cream, eyebrow "Press & Media", headline "Media Resources", muted lead. Remove pill chip + gradient.
- "What is VOVV.AI": keep prose, tighten max-width, white card on cream with eyebrow "About the company".
- Brand assets grid: replace shadcn cards with white rounded cards matching home aesthetic. Same 3 download tiles (Logo Dark, Logo White, Brand Colors). Outlined pill download buttons.
- Brand guidelines: 2-column white rounded cards, eyebrow "Brand guidelines".
- Press inquiries: replace muted gray section with the new final dark CTA: "Press & partnerships" → primary white pill `hello@vovv.ai`.

## 4. `src/pages/Team.tsx`

- Hero: cream, eyebrow "Your AI Creative Studio", headline "10 specialists. Zero overhead." (consolidate the duplicated heading), muted lead. Remove the secondary `Badge` chip.
- Team grid: keep video cards + stagger reveal. Restyle card to `bg-white rounded-2xl border border-[#f0efed] shadow-sm hover:shadow-md` (drop heavy `hover:shadow-xl` + `-translate-y-1`); softer, more editorial. Tighten avatar caption typography (smaller role text, muted description).
- "How Your AI Studio Team Works": cream/soft section, eyebrow "How it works", larger headline, 4-step grid with smaller circular icon tiles matching home `HomeHowItWorks`.
- Final CTA: replace current muted gray CTA with the dark `#1a1a2e` final CTA pattern (eyebrow + headline + 2 pill buttons + small trust line). Drop the email line (footer covers it).

---

## Out of scope

- No data file edits (`teamData.ts`, role lists, brand colors, etc.)
- No copy rewrites beyond hero eyebrows and small CTA microcopy
- No new images / videos / icons
- No nav, footer, or `PageLayout` changes
- No new routes or components

## Files touched

- `src/pages/About.tsx`
- `src/pages/Careers.tsx`
- `src/pages/Press.tsx`
- `src/pages/Team.tsx`
