## Plan: VOVV vs Pebblely comparison page

Mirror the existing `/compare/vovv-vs-claid-ai` and `/compare/vovv-vs-photoroom` implementations so the new page automatically inherits the homepage design system (typography, gradients, soft backgrounds, rounded cards, CTA styling).

### 1. New page: `src/pages/compare/VovvVsPebblely.tsx`

Compose from existing reusable parts:
- `SEOHead` — title, meta description, canonical, default OG image
- `JsonLd` — `BreadcrumbList` + `WebPage` (FAQPage emitted by `ComparisonFAQ`)
- `LandingNav` / `LandingFooter`
- `ComparisonHero` — eyebrow "VOVV vs Pebblely", headline "product scenes or complete e-commerce visual systems?", primary CTA → `/auth`, secondary → `/ai-product-photography`
- Hero comparison cards strip (Pebblely card + dark VOVV card)
- `QuickVerdictCards` — "The short answer", two cards
- `ComparisonTable` — 12 rows from the brief (AI product photography, AI backgrounds, quick ecommerce visuals, product page visuals, social, ads, campaign/editorial, UGC, on-model, category scenes, one-photo-to-set, best fit)
- `LandingValueCards` — "Why brands choose VOVV" 4-card grid
- `CompetitorStrengthsSection` — "When Pebblely is a good choice"
- `VOVVDifferenceSection` — "When VOVV is the better fit"
- Dark positioning section — "Pebblely creates product scenes. VOVV builds product visual systems."
- `WhoShouldChooseWhich` — decision split
- `ComparisonFAQ` — 5 FAQs (auto-emits FAQPage JSON-LD)
- Internal-link strip → `/ai-product-photography`, `/pricing`, `/compare`, `/app/generate/product-images`
- `ComparisonFinalCTA`

All copy taken verbatim from the brief.

### 2. Routing: `src/App.tsx`

Add lazy-loaded route `/compare/vovv-vs-pebblely → VovvVsPebblely`.

### 3. Hub: `src/pages/compare/CompareHub.tsx`

Flip the existing "Pebblely — Coming soon" card to a live link pointing at the new route.

### 4. Sitemap: `scripts/generate-sitemap.ts` + `public/sitemap.xml`

Append `/compare/vovv-vs-pebblely` and update the static sitemap file.

### 5. Footer

No individual footer link added (consistent with the previous Photoroom and Claid AI rollouts). Discovery flows through the existing "Compare VOVV.AI to Others" hub link.

### SEO details

- **Title**: `VOVV vs Pebblely: Which AI Product Photography Tool Is Best for E-commerce?`
- **Meta description**: `Compare VOVV and Pebblely for AI product photography, product scenes, ecommerce visuals, ads, social content, and campaign-ready product creative.`
- **Canonical**: `https://vovv.ai/compare/vovv-vs-pebblely`
- **JSON-LD**: BreadcrumbList (Home → Compare → VOVV vs Pebblely), WebPage, FAQPage (5 Q&A)
- Indexable; inherits standard prerender path used by other `/compare/*` pages.

### Files changed

- create `src/pages/compare/VovvVsPebblely.tsx`
- edit `src/App.tsx`
- edit `src/pages/compare/CompareHub.tsx`
- edit `scripts/generate-sitemap.ts`
- edit `public/sitemap.xml`

### Assumptions

- Pebblely card already exists in `CompareHub` as a "Coming soon" placeholder.
- Reusable `compare/*` components are stable and need no modification.
- Standard prerendering picks up new `/compare/*` routes automatically.
