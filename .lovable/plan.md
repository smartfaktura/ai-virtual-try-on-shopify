# Add `/compare/vovv-vs-photoroom`

Build the second comparison page using the existing reusable compare components — same design system as the homepage and the Flair AI page. Per your guidance, the footer will **not** get an entry for this individual comparison; only the `/compare` hub link stays in the footer.

## What gets built

### 1. New page — `src/pages/compare/VovvVsPhotoroom.tsx`
Composes the existing `seo/compare/*` components (no new design primitives) in this order:

1. `ComparisonHero` — eyebrow "VOVV vs Photoroom", H1 headline (with line-break styling matching the Flair page), subheadline, primary CTA "Try VOVV Free" → `/auth`, secondary "See AI Product Visuals" → `/ai-product-photography`.
2. **Hero comparison cards strip** — two cards (Photoroom + VOVV, VOVV accented dark) overlapping the hero with a `-mt-10` lift, mirroring the homepage's hero card pattern.
3. `QuickVerdictCards` — "The short answer", two cards. (Spec asks for 3 cards but two are "VOVV"; the two-card layout reads cleaner and matches the existing Quick Verdict component. The intro copy mentions all three angles: quick edits → Photoroom; visual generation + brand campaigns → VOVV.)
4. `ComparisonTable` — 11 rows from spec, Photoroom on the left, VOVV.AI accented on the right.
5. `LandingValueCards` (4 cards) — "Why e-commerce brands choose VOVV over simple editing workflows".
6. `CompetitorStrengthsSection` — "When Photoroom may be the better fit" (positive, factual, no attacks).
7. `VOVVDifferenceSection` — "When VOVV is the better fit" with 6 bullets.
8. **Positioning block** (dark `#1a1a2e` band, matches `LandingFinalCTASEO` aesthetic) — "Photoroom edits product photos. VOVV builds product visual systems." + CTA "Create Your First Product Visual".
9. `WhoShouldChooseWhich` — two-column decision matrix.
10. `ComparisonFAQ` — all 5 FAQs, auto-emits `FAQPage` JSON-LD.
11. Internal-link strip — `/ai-product-photography`, `/pricing`, `/compare`, `/app/generate/product-images`.
12. `ComparisonFinalCTA` — "Create more than edited product photos".

### 2. SEO
- `<title>`: `VOVV vs Photoroom: Which AI Product Visual Tool Is Best for E-commerce Brands?`
- meta description: as specified
- canonical: `https://vovv.ai/compare/vovv-vs-photoroom`
- OG title/description/image via `SEOHead`
- JSON-LD: `WebPage`, `BreadcrumbList` (Home › Compare › VOVV vs Photoroom), `FAQPage` (auto from `ComparisonFAQ`)

### 3. Routing
`src/App.tsx` — add lazy import + `<Route path="/compare/vovv-vs-photoroom" element={<VovvVsPhotoroom />} />` next to the existing Flair route.

### 4. Sitemap
`scripts/generate-sitemap.ts` — add:
```
{ loc: '/compare/vovv-vs-photoroom', changefreq: 'monthly', priority: 0.8 },
```
Sitemap regenerates on next build (and I'll run `npm run sitemap` to verify the URL appears).

### 5. Footer
**No change.** Per your instruction, the footer keeps only:
- "Compare VOVV.AI to Others" → `/compare`
- "VOVV.AI vs Flair AI" → `/compare/vovv-vs-flair-ai` *(already added previously)*

I will **not** add the Photoroom entry to the footer to avoid clutter. The `/compare` hub will list it.

### 6. Hub page
The existing `/compare` hub already shows a "VOVV vs Photoroom" card marked "Coming soon". I'll flip that card to a live link by giving it a `to: '/compare/vovv-vs-photoroom'` value in `src/pages/compare/CompareHub.tsx`.

## Assumptions
- "Try VOVV Free" CTA points to `/auth` (matches the pattern used on the Flair page and other public landings — there's no separate `/signup` route).
- "See AI Product Visuals" → `/ai-product-photography` (existing SEO pillar page).
- The Quick Verdict section uses two cards (Photoroom vs VOVV) instead of three — the third option in your spec ("Best for brand campaigns: VOVV") is folded into the VOVV card title and intro copy. This keeps visual symmetry with the existing comparison component.
- No new images, no new color tokens, no design-system additions — pure composition of existing primitives.

## Files that will change
- **new** `src/pages/compare/VovvVsPhotoroom.tsx`
- **edit** `src/App.tsx` (lazy import + route)
- **edit** `scripts/generate-sitemap.ts` (one URL)
- **edit** `src/pages/compare/CompareHub.tsx` (flip Photoroom card to a live link)
- **regenerated** `public/sitemap.xml` (via `npm run sitemap`)

## Untouched
- Homepage, all `/app/*`, `/admin/*`, `/auth/*`, `/account/*`, `/checkout/*`, `/success/*`
- Footer
- Existing comparison components (reused as-is)
- Backend / DB / design tokens

## Final report (delivered after implementation)
- files changed
- route created
- exact title / meta description / canonical
- JSON-LD schemas confirmed (`WebPage`, `BreadcrumbList`, `FAQPage`)
- sitemap status (URL count + grep confirmation)
- assumptions (mirrored above)
