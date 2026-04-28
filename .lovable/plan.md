# Compare Hub + VOVV vs Flair AI Comparison Page

Build a reusable, on-brand comparison page system for VOVV.AI, then ship the first comparison page (Flair AI). Reuse existing landing components so it visually matches the homepage and other SEO pages — no separate template look.

## What gets built

### 1. Reusable comparison components
New folder `src/components/seo/compare/`:
- `ComparisonHero.tsx` — eyebrow + H1 + subheadline + dual CTA, same scale/spacing as `LandingHeroSEO`
- `QuickVerdictCards.tsx` — two-card "Choose X if…" block
- `ComparisonTable.tsx` — responsive table (desktop) / stacked card list (mobile), with VOVV column subtly accented
- `UseCaseComparisonCards.tsx` — grid of use-case cards, each showing both products' angle
- `CompetitorStrengthsSection.tsx` — neutral, factual "What X Does Well" block
- `VOVVDifferenceSection.tsx` — bullet list block for VOVV's differentiation
- `WhoShouldChooseWhich.tsx` — two-column decision block (wraps existing `LandingDecisionMatrix` style)
- `ComparisonFAQ.tsx` — wraps existing `LandingFAQConfig` so structured data + accordion stay consistent
- `ComparisonFinalCTA.tsx` — wraps `LandingFinalCTASEO`

All components reuse: same `max-w-7xl` containers, `bg-[#FAFAF8]` / `soft` section variants, Inter typography scale, rounded-2xl cards, subtle borders, same button styles as the rest of the public site. No new color tokens, no new shadows.

### 2. `/compare` hub page
File: `src/pages/compare/CompareHub.tsx`. Sections:
- Hero (eyebrow, H1, subheadline, dual CTA)
- Intro value section ("Find the right AI visual workflow…")
- Comparison cards grid: VOVV vs Flair AI (linked), VOVV vs Photoroom / Claid AI / Pebblely (rendered with a "Coming soon" badge, non-clickable)
- "How we compare tools" — 4 criteria cards using `LandingValueCards` style
- Final CTA
- SEO: title, meta description, canonical `https://vovv.ai/compare`, BreadcrumbList JSON-LD, `CollectionPage` JSON-LD

### 3. `/compare/vovv-vs-flair-ai` page
File: `src/pages/compare/VovvVsFlairAi.tsx`. Composes the reusable components in this order:
1. `ComparisonHero`
2. `QuickVerdictCards` (two balanced cards)
3. `ComparisonTable` (12 rows, copy from spec; uncertain rows use "Available depending on current plan and workflow")
4. `CompetitorStrengthsSection` — "What Flair AI Does Well"
5. `VOVVDifferenceSection` — "Where VOVV.AI Is Different" + 6 bullets
6. `UseCaseComparisonCards` — 4 use-case cards
7. `WhoShouldChooseWhich`
8. `ComparisonFAQ` — 6 FAQs from spec
9. `ComparisonFinalCTA`
10. Internal-link strip (subtle, near footer): `/ai-product-photography`, `/ai-product-photography/fashion`, `/ai-product-photography/jewelry`, `/discover`, `/pricing`, `/auth`

SEO/meta:
- `<title>`: `VOVV vs Flair AI: AI Product Photography Comparison for E-commerce`
- meta description as specified
- canonical: `https://vovv.ai/compare/vovv-vs-flair-ai`
- OG title/description as specified, default OG image
- JSON-LD: `WebPage`, `BreadcrumbList` (Home › Compare › VOVV vs Flair AI), `FAQPage` (auto-emitted by `ComparisonFAQ`)

Tone: balanced, factual, never bashes Flair AI, no superlatives like "better in every way."

### 4. Routing
`src/App.tsx` — add two public routes near the other SEO routes:
```
<Route path="/compare" element={<CompareHub />} />
<Route path="/compare/vovv-vs-flair-ai" element={<VovvVsFlairAi />} />
```
Both lazy-imported, same pattern as existing pages.

### 5. Sitemap
Edit `scripts/generate-sitemap.ts` `MARKETING_URLS`:
```
{ loc: '/compare',                      changefreq: 'monthly', priority: 0.7 },
{ loc: '/compare/vovv-vs-flair-ai',     changefreq: 'monthly', priority: 0.8 },
```
Sitemap regenerates automatically on build (`npm run build` runs the script). No other compare routes added yet.

### 6. Footer
Edit `src/components/landing/LandingFooter.tsx` — extend the existing `Solutions › Compare` group with a new entry:
- "Compare VOVV.AI to Others" → `/compare`
- "VOVV vs Flair AI" → `/compare/vovv-vs-flair-ai`
(Keeps existing "AI vs Photoshoot" and "VOVV.AI vs Studio" entries.)

### 7. Prerender note
The project does not run a separate prerender pipeline (no react-snap / vite-plugin-ssg). SEO discoverability is currently provided by `react-helmet-async` (title/meta/canonical/JSON-LD) + `sitemap.xml`, the same pattern every existing SEO page uses (`/ai-product-photography-vs-photoshoot`, etc.). The new pages will follow the exact same pattern so Google/Bing receive the head tags and structured data on crawl. If you want true static prerendering added as a separate pipeline, that's a larger infra task — flag it and I'll scope it as its own plan.

## Out of scope / untouched
- `/app/*`, `/admin/*`, `/auth/*`, `/account/*`, `/checkout/*`, `/success/*`
- No new color tokens, fonts, or design primitives
- No backend/DB changes
- Other comparison pages (Photoroom, Claid, Pebblely) — only "Coming soon" cards on hub

## Final report after implementation
Will confirm: routes created, exact title/meta/canonical, FAQPage JSON-LD present, sitemap entries added, footer updated, no private routes touched, both pages render with correct head tags.
