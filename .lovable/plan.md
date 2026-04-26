## Footer additions + new Freestyle Studio marketing page

### Part 1 — Footer link additions

Edit `src/components/landing/LandingFooter.tsx`:

**Solutions** column — add 2 links:
- "Home & Furniture" → `/ai-product-photography/home-furniture`
- "Electronics & Gadgets" → `/ai-product-photography/electronics-gadgets`

**Resources** column — add 4 links (insert near top, before Blog):
- "How It Works" → `/how-it-works`
- "FAQ" → `/faq`
- "Careers" → `/careers`
- "Press" → `/press`

**Product** column — repoint:
- "Freestyle Studio" → change from `/freestyle` to `/features/freestyle` (the new marketing page)

### Part 2 — New Freestyle Studio marketing page

**Route:** `/features/freestyle` (sits alongside `/features/workflows`, `/features/perspectives`, etc.)

**File:** `src/pages/features/FreestyleFeature.tsx` — registered in `src/App.tsx`.

**Why a new route (not reusing `/freestyle`):** `/freestyle` is a working public preset gallery + prompt builder (presets browser with an interactive prompt bar). It's not a marketing landing page. The user wants a polished feature page in the same aesthetic as `/home` and `/` — hero, sections, CTAs.

#### Page structure (matches existing `/features/*` aesthetic)

Wrapped in `PageLayout` with `SEOHead` + JSON-LD (same pattern as `WorkflowsFeature.tsx`).

1. **Hero — animated preview**
   - Eyebrow: "FREESTYLE STUDIO"
   - H1: *Your creative studio. No limits.*
   - Sub: *Describe what you want, pick your inputs, and get studio-quality images in seconds.*
   - Primary CTA: "Try it free" → `/auth?redirect=/app/freestyle`
   - Secondary CTA: "See examples" → `/freestyle` (the preset gallery)
   - **Animated preview:** reuse the existing `FreestyleShowcaseSection` animation (typewriter prompt → chip selection → progress bar → 3 result cards) by extracting/importing that component. It already animates exactly the headline/sub copy the user requested.

2. **What you can do (capability grid)** — built from auditing `/app/freestyle`:
   - **Open prompts** — natural-language scene direction
   - **Mix references** — products + models + scene presets in one shot
   - **Edit existing images** — image-role selector (edit / restyle / extend) from `ImageRoleSelector`
   - **Style presets** — quick-apply via `StylePresetChips` / `FreestyleQuickPresets`
   - **Brand-locked output** — `BrandProfileChip` for palette/mood lock
   - **Pro camera + framing controls** — aspect ratio, framing, camera style, quality (from `FreestyleSettingsChips`)
   - **Negatives** — exclude unwanted elements (`NegativesChip`)
   - **Browse the Discover gallery** — remix any preset

   3-column grid of icon + title + 1-line description. Icons from lucide-react (Sparkles, Layers, Wand2, ImagePlus, Palette, Camera, etc.).

3. **How it works** — 3-step horizontal: Describe → Add inputs → Generate. Mirrors hero animation.

4. **Showcase strip** — pull 6-8 thumbnails from `useDiscoverPresets` (freestyle-only) for a real gallery preview, click → `/freestyle/:id`.

5. **Comparison strip** — "vs. Visual Studio (workflows)": when to pick Freestyle (open creative direction) vs. Visual Studio (templated batch generation). Helps SEO/discoverability.

6. **FAQ** — 4-5 questions reusing existing FAQ accordion style (do I need a brief? credits? can I edit a photo? etc.).

7. **Final CTA** — gradient panel "Start creating free" → `/auth?redirect=/app/freestyle`.

#### SEO

- Title: "Freestyle Studio — Open AI Image Studio for Brands | VOVV.AI"
- Description: "Describe what you want, pick your inputs, and get studio-quality product images in seconds. Open-prompt creative studio for brands."
- Canonical: `${SITE_URL}/features/freestyle`
- JSON-LD: SoftwareApplication schema (matches other feature pages)

#### Files changed

- `src/components/landing/LandingFooter.tsx` — link list updates
- `src/pages/features/FreestyleFeature.tsx` — NEW
- `src/App.tsx` — register `/features/freestyle` route (in public routes block, lazy-loaded like the other feature pages)
- `public/sitemap.xml` — add new URL
- `public/version.json` — bump

### Out of scope

- No changes to `/freestyle` (preset gallery stays as-is)
- No changes to `/app/freestyle` (the authenticated studio)
- No new copy beyond what's needed; reuses homepage Freestyle section animation rather than re-building it
