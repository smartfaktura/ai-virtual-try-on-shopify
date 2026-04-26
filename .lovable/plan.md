## 3 things in this plan

### 1. Fix broken "See examples" anchor links on category hub pages (BUG)

**Diagnosis:** On every `/ai-product-photography/{category}` hub page, the "See examples" CTA in the hero jumps to `#scenes`. That ID points to `CategoryBuiltForEveryCategory` — the **subcategory chip switcher**, not the actual scene examples grid. The real examples grid (`CategorySceneExamples`) lives at `id="scene-library"`. A second instance — `CategorySubcategoryChips` — links to `#outputs` (Visual Outputs section), which is also not "examples".

**Fix:**
- `src/components/seo/photography/category/CategoryHero.tsx` → change the "See examples" `href` from `#scenes` to `#scene-library`
- `src/components/seo/photography/category/CategorySubcategoryChips.tsx` → change `#outputs` to `#scene-library`
- Audited every other `href="#..."` and `to="#..."` on public/landing/SEO pages; all other anchor targets resolve correctly (`#categories`, `#examples`, `#positions`, `#outputs` when intentional).

### 2. New page: `/why-vovv` — Why VOVV

A premium, SEO-optimized "Why choose VOVV.AI" page with concrete ROI, time, and creative benefits. Follows the same `/home`-style aesthetic as About / Features pages: warm `#FAFAF8` background, dark `#1a1a2e` headings, generous vertical rhythm, soft `#f5f5f3` band sections, subtle borders and rounded-3xl cards.

**Sections (in order):**
1. **Hero** — Eyebrow "Why VOVV.AI" · H1 "Studio-grade product photography. Without the studio." · Subhead about replacing shoots with one upload · Primary CTA "Start free" · Secondary "See pricing"
2. **ROI strip** — 4 stat tiles: ~95% lower cost vs traditional shoot · Hours not weeks · 8+ scene styles per upload · 50+ category-tuned scenes
3. **Cost comparison** — Side-by-side card: "Traditional product shoot" (model fees, studio rental, retouching, location, weeks of lead time, ~$1.5k–$10k per shoot) vs "VOVV.AI" (one upload, minutes, fixed monthly cost, unlimited iteration). Numbers framed as "industry typical" — no fabricated claims.
4. **What you get** — 6 benefit cards: brand-locked outputs, category-tuned scenes, on-model & lifestyle, multi-angle consistency, ad-ready aspect ratios, Shopify/Amazon/Meta-ready
5. **Built for ecommerce teams** — 3-column: Founders & DTC owners · Marketing & growth teams · Agencies & creative studios — each with a one-line ROI angle
6. **Speed timeline** — Visual timeline: traditional 3–6 weeks vs VOVV minutes
7. **Quality you can ship** — Trust band: brand-locked, label-accurate, copy/text mentioning "review final visuals before publishing" (consistent with FAQ language)
8. **vs alternatives mini-grid** — Quick chip comparison vs generic AI tools, Photoshop, traditional studio (links to existing `/ai-product-photography-vs-photoshoot` and `/ai-product-photography-vs-studio`)
9. **FAQ** — 5 ROI-focused questions (How much can I save? · Will visuals be brand-consistent? · How fast is it? · Do I own the images? · Can I use them for ads?)
10. **Final CTA** — gradient band with "Start free, no credit card"

**SEO:**
- Meta title: `Why VOVV.AI · Better Product Photography ROI for Ecommerce Brands`
- Meta description: leads with "Replace expensive product shoots with AI..."
- Canonical, OG image, BreadcrumbList + WebPage JSON-LD
- Footer link added under **Resources**: "Why VOVV.AI" → `/why-vovv`

### 3. New page: `/roadmap` — Public roadmap + feature requests

Honest, non-fantasy roadmap with the exact items you specified, plus a lightweight "Request a feature" form.

**Sections:**
1. **Hero** — Eyebrow "Roadmap" · H1 "What we're shipping next." · Subhead "Honest about what's live, what's near, and what's exploratory." · CTA "Request a feature" (smooth-scrolls to form)
2. **Three columns** (kanban style, no fake dates):
   - **Now (live this quarter)** — Scale up to more shots per category · Improved brand-locking · Faster generation pipeline
   - **Next** — Seasonal drops (auto-generated holiday/seasonal scene packs) · Special campaign packs (Black Friday, Valentine's, summer launches) · New video features (extended Short Film durations, more cinematic styles, voiceover variants)
   - **Exploring** — Multi-product set photography · Auto-resize for marketplaces · Team collaboration spaces
3. **Recently shipped** — Bulleted list of 6–8 real recent additions (e.g., Freestyle Studio open prompts, brand models, learn hub, category-aware shots) — pulled from existing project memory so they're factually accurate
4. **Request a feature form** — `id="request"` anchor. Fields: name (optional), email (required), feature title, description (textarea), category dropdown (Product images / Video / Brand / Other). On submit, inserts into a new `feature_requests` Supabase table. Success toast + "Thanks — we read every one."
5. **Final CTA** — Link to `/contact` for partnership/enterprise asks

**Backend (Lovable Cloud):**
- New table `public.feature_requests` with columns: `id uuid pk`, `created_at timestamptz`, `email text not null`, `name text`, `title text not null`, `description text not null`, `category text`, `user_id uuid null` (auto-attached if logged in), `status text default 'new'`, `votes int default 0`
- RLS enabled. Policies:
  - INSERT: anyone (`true`) — public submissions allowed
  - SELECT: only admins via `has_role(auth.uid(), 'admin')`
  - UPDATE/DELETE: admins only
- Submission goes through the standard Supabase JS client; no edge function needed for v1

**SEO:**
- Meta title: `VOVV.AI Roadmap · What's Shipping Next`
- Meta description leads with "See what we're building..."
- BreadcrumbList + WebPage JSON-LD
- Footer link added under **Resources**: "Roadmap" → `/roadmap`

### Files changed/created

**Bug fix:**
- `src/components/seo/photography/category/CategoryHero.tsx` (anchor)
- `src/components/seo/photography/category/CategorySubcategoryChips.tsx` (anchor)

**Why VOVV page:**
- `src/pages/WhyVovv.tsx` (new)
- `src/App.tsx` (lazy import + route `/why-vovv`)

**Roadmap page:**
- `src/pages/Roadmap.tsx` (new)
- `src/App.tsx` (lazy import + route `/roadmap`)
- New migration: create `feature_requests` table + RLS policies

**Footer + sitemap:**
- `src/components/landing/LandingFooter.tsx` — add "Why VOVV.AI" and "Roadmap" under Resources
- `public/sitemap.xml` — add `/why-vovv` and `/roadmap` URLs
- `public/version.json` bump

### Out of scope

- Redesigning category hub layout (only the broken anchor is changed)
- Public voting on roadmap items (admin-only votes column added for future)
- Email notifications on new feature requests (admins can monitor via the table)
