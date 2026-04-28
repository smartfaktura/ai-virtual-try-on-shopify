## Plan: VOVV vs Claid AI comparison page

Reuse the existing comparison design system (same components used by `/compare/vovv-vs-photoroom` and `/compare/vovv-vs-flair-ai`) so the new page automatically inherits the homepage aesthetic — typography, spacing, gradients, soft backgrounds, rounded cards, and CTA styling.

### 1. New page: `src/pages/compare/VovvVsClaidAi.tsx`

Compose the page from existing reusable parts:
- `SEOHead` — title, meta description, canonical
- `JsonLd` — BreadcrumbList + WebPage + FAQPage (FAQPage emitted by `ComparisonFAQ`)
- `LandingNav` / `LandingFooter`
- `ComparisonHero` — eyebrow "VOVV vs Claid AI", headline "image enhancement or full product visual creation?", primary CTA → `/auth`, secondary → `/ai-product-photography`
- Hero comparison cards strip (Claid AI card + dark VOVV card) — same visual treatment as Photoroom page
- `QuickVerdictCards` — "The short answer" with two stacked cards
- `ComparisonTable` — 13 rows (image upscaling, enhancement, background generation, cleanup, API automation, product page visuals, social, ads, campaign/editorial, on-model, category scenes, one-photo-to-set, best fit)
- `LandingValueCards` — "Why brands choose VOVV" 4-card grid
- `CompetitorStrengthsSection` — "When Claid AI is a good choice"
- `VOVVDifferenceSection` — "When VOVV is the better fit"
- Dark positioning section — "Claid AI enhances product images. VOVV creates product visual systems."
- `WhoShouldChooseWhich` — decision split
- `ComparisonFAQ` — 5 FAQs (auto-emits FAQPage JSON-LD)
- Internal-link strip → `/ai-product-photography`, `/pricing`, `/compare`, `/app/generate/product-images`
- `ComparisonFinalCTA`

All copy taken verbatim from the brief.

### 2. Routing: `src/App.tsx`

Add a lazy-loaded route:
```
/compare/vovv-vs-claid-ai → VovvVsClaidAi
```

### 3. Hub: `src/pages/compare/CompareHub.tsx`

Flip the existing "Claid AI — Coming soon" card to a live link pointing at the new route. No layout changes.

### 4. Sitemap: `scripts/generate-sitemap.ts` + `public/sitemap.xml`

Add `/compare/vovv-vs-claid-ai` to the static URL list and regenerate `public/sitemap.xml`.

### 5. Footer

Per the user's instruction, do NOT add an individual link to `LandingFooter`. The existing "Compare VOVV.AI to Others" hub link in the footer already covers discovery.

### SEO details

- **Title**: `VOVV vs Claid AI: Which AI Product Image Tool Is Best for E-commerce Brands?`
- **Meta description**: `Compare VOVV and Claid AI for AI product photography, image enhancement, upscaling, product page visuals, social content, ads, and campaign-ready e-commerce creative.`
- **Canonical**: `https://vovv.ai/compare/vovv-vs-claid-ai`
- **JSON-LD**: BreadcrumbList (Home → Compare → VOVV vs Claid AI), WebPage, FAQPage (5 Q&A)
- Indexable (no `noindex`); inherits the standard prerender path used by the other `/compare/*` pages.

### Files changed

- create `src/pages/compare/VovvVsClaidAi.tsx`
- edit `src/App.tsx` (add route)
- edit `src/pages/compare/CompareHub.tsx` (activate Claid AI card)
- edit `scripts/generate-sitemap.ts` (add URL)
- regenerate `public/sitemap.xml`

### Assumptions

- Claid AI card already exists in `CompareHub` as a "Coming soon" placeholder (matches the previous Photoroom flow).
- Reusable `compare/*` components are stable and need no modification.
- Standard prerendering automatically picks up new `/compare/*` routes (consistent with prior pages).
