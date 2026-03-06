

## Enhance Workflows Feature Landing Page

The current page is generic — just a hero, 3 benefit cards, 3 steps, and a CTA. The user wants each of the 6 actual workflows showcased with engaging descriptions to convert visitors.

### Plan

**File: `src/pages/features/WorkflowsFeature.tsx`** — Rewrite to include:

1. **Hero** (keep, refine copy) — Headline + subtitle + CTA
2. **Workflow Showcase Section** (new) — 6 alternating left/right blocks, one per workflow:
   - **Virtual Try-On Set** — AI-powered try-on on 30+ diverse models, editorial quality, all ratios
   - **Product Listing Set** — E-commerce ready, 30 scene options, category-aware lighting, marketplace-optimized
   - **Selfie / UGC Set** — Authentic creator-style content, natural compositions, social proof ready
   - **Flat Lay Set** — Curated overhead arrangements, styled props, Instagram-ready
   - **Mirror Selfie Set** — Realistic mirror compositions, phone-in-hand, diverse room environments
   - **Interior / Exterior Staging** — Transform empty rooms, 12+ design styles, architecture preserved

   Each block has: icon, workflow name as heading, 2-line description, 3-4 bullet features (reuse from `featureMap` in WorkflowCard), and a "Try Free" CTA button linking to `/auth`.

   Layout: alternating image-left/text-right, text-left/image-right pattern. Since we don't have public preview images for all workflows, use icon-based decorative elements with gradient backgrounds instead of images.

3. **Why Workflows** (keep existing 3 benefits section)
4. **How It Works** (keep existing 3 steps)
5. **Final CTA** (keep, with stronger copy)

All static content — no database queries needed. The workflow names, descriptions, and features are hardcoded matching the DB data and `featureMap`.

