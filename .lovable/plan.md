## Plan: Footer trim + Discover gallery on /compare pages

### 1. Footer cleanup — `src/components/landing/LandingFooter.tsx`

In the **Compare** group:
- Rename `Compare VOVV.AI to Others` → `VOVV.AI to Others` (still links to `/compare`).
- Remove the standalone `VOVV.AI vs Flair AI` link.

Resulting Compare list:
- `VOVV.AI to Others` → `/compare`
- `AI vs Photoshoot` → `/ai-product-photography-vs-photoshoot`
- `VOVV.AI vs Studio` → `/ai-product-photography-vs-studio`

(Individual `vs-*` pages stay discoverable via the hub.)

### 2. New reusable component — `src/components/seo/compare/DiscoverGalleryStrip.tsx`

A premium, lazy-loaded image grid that pulls live featured imagery from the `discover_presets` table (publicly readable, same source as `/discover`). Tiles deep-link to `/discover/{slug}` so SEO juice flows back to the public Discover page.

Props:
- `eyebrow`, `headline`, `intro`, `count` (default 8), `gridClassName`, `background` (`soft` | `background` | `transparent`), `cta`, `tileAspect` (default `aspect-[4/5]`).

Visual treatment matches the homepage / compare aesthetic — Inter type, rounded-2xl tiles, subtle border + shadow, soft hover lift, no harsh shadows. Skeletons render during fetch so the section never shows empty.

Data source: `supabase.from('discover_presets').select('id, title, image_url, slug').order('sort_order').limit(count)` — reuses the same public pipeline as `useDiscoverPresets`.

### 3. `/compare` (CompareHub.tsx)

Insert a **larger** gallery section (12 tiles, 3-col / 4-col responsive) after the comparison cards grid and before "How we compare tools":

- Eyebrow: `Made with VOVV.AI`
- Headline: `A glimpse of what brands create`
- Intro: `Real product visuals generated from a single product photo — straight from the VOVV.AI Discover feed.`
- CTA: `Explore all examples` → `/discover`

### 4. Each `/compare/vovv-vs-{flair-ai,photoroom,claid-ai,pebblely}` page

Insert a **compact** gallery strip (8 tiles, 2/4 col) just before the "Internal-link strip" section. Matches each page's tone:

- **vs-flair-ai**: "Brand-ready visuals from one product photo"
- **vs-photoroom**: "Beyond background removal — what brands ship with VOVV.AI"
- **vs-claid-ai**: "More than enhanced photos — visuals brands actually publish"
- **vs-pebblely**: "From product scenes to full visual systems"

All CTAs → `/discover`. Tiles deep-link into Discover.

### 5. Out of scope

- Homepage untouched.
- `/app` routes untouched.
- No DB / RLS / sitemap changes (gallery uses an existing public table).
- No new copy claims; intros stay factual.

### Files changed

- edit `src/components/landing/LandingFooter.tsx`
- create `src/components/seo/compare/DiscoverGalleryStrip.tsx`
- edit `src/pages/compare/CompareHub.tsx`
- edit `src/pages/compare/VovvVsFlairAi.tsx`
- edit `src/pages/compare/VovvVsPhotoroom.tsx`
- edit `src/pages/compare/VovvVsClaidAi.tsx`
- edit `src/pages/compare/VovvVsPebblely.tsx`

### Assumptions

- `discover_presets` is publicly readable (confirmed — already used by `/discover` for anonymous visitors and rows include public Supabase storage URLs).
- Sort order in the table reflects editorial curation; pulling top N by `sort_order` gives the strongest visuals — same priority used on `/discover`.
