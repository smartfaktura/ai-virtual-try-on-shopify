
## New SEO landing page: `/ai-product-photography/phone-cases`

Built the same way wedding-dresses is built — a sub-niche entry in the shared `aiProductPhotographyCategoryPages.ts` array that the dynamic template `AIProductPhotographyCategory.tsx` renders. No new components, no new route, no new card on the main hub.

### Files to edit

**1. `src/data/aiProductPhotographyCategoryPages.ts`** — append a new `phone-cases` entry at the end (after wedding-dresses). Content drawn from the live `phone-cases` scene collection (32 active editorial + creative scenes).

Key fields:
- `slug: 'phone-cases'`, `url: ${BASE}/phone-cases`, `groupName: 'Phone Cases'`
- `seoTitle: 'AI Phone Case Photography for Accessory Brands | VOVV.AI'`
- `metaDescription`: editorial phone case visuals, lifestyle scenes and PDP shots from one upload
- `h1Lead: 'AI phone case photography,'`, `h1Highlight: 'from a single upload'`
- `heroEyebrow: 'Editorial · Lifestyle · PDP'`
- `primaryKeyword: 'AI phone case photography'`; secondary + long-tail tuned for "phone case photography", "iPhone case Shopify photos", "MagSafe case visuals", "phone case lifestyle photos", "AI phone case ads"
- `subcategories: ['Clear', 'MagSafe', 'Silicone', 'Leather', 'Printed', 'Wallet Cases']`
- `visualOutputs` (8 tiles): Editorial lifestyle, Poolside & beach, Pilates & active, Café & travel, Color flatlays, On-body closeups, Campaign heroes, Social ad creatives
- `sceneExamples` (8 real scenes from DB, using their `preview_image_url` IDs):
  - Coastal Call · `1779952756981-gnkhvd`
  - Saltwater Case Glow · `1779952784987-6zcgd4`
  - Glossy Case Selfie · `1779954089918-y30ofu`
  - Poolside Case Kiss · `1779953205374-fogmii`
  - Pilates Case Selfie · `1779952779562-ueyyov`
  - Citrus Case Flatlay · `1779952985161-cerwur`
  - Sun Kissed Case · `1779952807944-dzh93u`
  - Dynamic Bloom Studio · `1779954083352-msu7cd`
- `useCases`: Shopify PDPs, Print-on-demand stores, Pinterest & Instagram, Lookbooks, Meta/TikTok ads, Email banners
- `faqs`: 5 Q&As tuned to phone case brands (preserves print/pattern fidelity, MagSafe cutouts, Shopify-ready, etc.)
- `relatedCategories: ['electronics-gadgets', 'bags-accessories', 'jewelry', 'fashion']`
- `heroImageId: '1779952756981-gnkhvd'` (Coastal Call — strongest editorial)
- `heroNoun: 'case'`
- `heroCollage` (4 stills, no video — no phone-case motion assets exist):
  - Editorial · `1779952784987-6zcgd4`
  - Lifestyle · `1779952779562-ueyyov`
  - Flatlay   · `1779952985161-cerwur`
  - Poolside  · `1779953205374-fogmii`

**2. `src/pages/seo/AIProductPhotographyCategory.tsx`** — add `'phone-cases'` to `hidePainAndUseCases` so pain points + use cases hide (same treatment as wedding-dresses; keeps the page tight and lets motion/feed showcases stay null-gated).

Actually keep `useCases` visible because we have strong commerce use cases — only hide pain points. **Revision**: leave the `hidePainAndUseCases` array as-is, do NOT add phone-cases. The pain points + use cases section is valuable for phone case brands.

**3. `src/lib/visualLibraryDeepLink.ts`** — add `'phone-cases': { family: 'tech', collection: 'phone-cases' }` so the page's "Browse scenes" CTAs deep-link into the Visual Library filtered to phone cases.

**4. `src/data/aiProductPhotographyCategoryPages.ts`** — update **electronics-gadgets** `relatedCategories` to include `'phone-cases'` so there's a reciprocal entry point from the tech hub page.

**5. `src/components/landing/LandingFooter.tsx`** — add `{ label: 'Phone Cases Product Photography', to: '/ai-product-photography/phone-cases' }` after the Wedding Dresses footer entry.

### Auto-picked up
- Sitemap (`scripts/generate-sitemap.ts`) iterates `aiProductPhotographyCategoryPages`, so the new URL appears automatically.
- `CategoryMotionShowcase` and `CategoryFeedShowcase` are slug-gated and return `null` when no curated assets exist — they will silently skip on this page.
- Route `/ai-product-photography/:slug` already exists.

### Out of scope
- No motion-clip assets (none exist for phone cases yet).
- No feed showcase asset.
- No new card on the main `/ai-product-photography` hub (wedding-dresses was added there in an earlier turn; if you also want phone-cases on the hub, say so and I'll add it).
