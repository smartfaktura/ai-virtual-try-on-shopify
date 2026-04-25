## Goal
1. Diagnose & fix the "/discover feels like a reload" perception.
2. Decide and update the public navigation links — including a new **Scene Library** link.
3. Build a dedicated **/how-it-works** page that matches the homepage aesthetic.

---

## 1. Why /discover feels like a reload (and the fix)

It is *not* actually reloading — `LandingNav` already calls `navigate('/discover')` (proper React Router SPA navigation). The "reload" feeling comes from three things stacking:

1. **`PublicDiscover` is `lazy()`-loaded** (chunk split in `App.tsx`). On first click, the bundle has to download — during that gap the global `<Suspense fallback={<BrandLoaderProgressGlyph fullScreen />}>` paints a full-screen loader, the nav momentarily disappears, then everything re-mounts. That's the "blink → same nav" sensation.
2. **No scroll-to-top** between routes — landing on `/discover` after scrolling on `/home` can keep an odd scroll position.
3. **The active route is not visually marked in the nav**, so after navigation the bar looks identical to before, reinforcing the "nothing changed" feeling.

### Fix (small, surgical)
File: `src/components/landing/LandingNav.tsx`

- Use `<Link>` (instead of programmatic `navigate()` from a `<button>`) for routed links. This gives proper hover/focus, prefetch hints, and removes the need for the `handleNavClick` route branch.
- Add an **active state** to nav links: when `useLocation().pathname` matches the link's route, render with `text-sidebar-foreground` + a subtle 1px underline. Now the bar visibly reflects the page.
- Add a `ScrollToTop` helper (already common in routers) that scrolls to top on route change. New file `src/components/ScrollToTop.tsx`, mounted once inside `<BrowserRouter>` in `src/App.tsx`.
- Keep `BrandLoaderProgressGlyph` but render the `LandingNav` *outside* the lazy boundary so the nav stays visible during route chunk loads. We do this by lifting `LandingNav` into a `LandingShell` that wraps the public routes, with `<Suspense>` rendering only the page body. Practically: split the affected public routes (`/home`, `/discover`, `/pricing`, `/product-visual-library`, `/ai-product-photography`, `/how-it-works`) into a small route group inside `App.tsx` whose `element` is a `LandingShell` layout (`<><LandingNav /><Suspense><Outlet/></Suspense><LandingFooter/></>`). The pages themselves stop rendering their own nav/footer.

This eliminates the "nav disappears for a beat" symptom and makes lazy chunk loading invisible.

## 2. Public navigation — final link set

Recommendation (5 items, fits comfortably in the wide 1600px nav):

| Label          | Route                       | Notes                             |
| -------------- | --------------------------- | --------------------------------- |
| Explore        | `/discover`                 | community + preset gallery        |
| Scene Library  | `/product-visual-library`   | NEW — surfaces the 1600+ scenes   |
| How It Works   | `/how-it-works`             | NEW dedicated page (see §3)       |
| Pricing        | `/pricing`                  | unchanged                         |
| FAQ            | `#faq`                      | scrolls to FAQ on `/home`, navigates to `/home#faq` from elsewhere |

Mobile menu shows the same 5 items.

File: `src/components/landing/LandingNav.tsx` — update `navLinks` constant.

## 3. New page: /how-it-works

A premium standalone page that reuses the homepage visual language. Reuses existing components where possible and adds two new ones to deepen the story.

### Route + scaffolding
- `src/App.tsx`: add `const HowItWorks = lazy(() => import('@/pages/HowItWorks'));` and route `<Route path="/how-it-works" element={<HowItWorks />} />` inside the new public landing shell.
- `public/sitemap.xml`: append `/how-it-works`.
- `src/pages/HowItWorks.tsx`: SEOHead + JSON-LD `HowTo` schema.

### Section order (top → bottom)

1. **Hero** (`HowItWorksHero`, new)
   - Eyebrow: `How it works`
   - H1: *"From one product photo to a full visual system."*
   - Subtitle: *"Upload a product. Pick the visuals you want. Get every angle, scene, and campaign asset in minutes."*
   - Primary CTA: **Try it on my product** → `/auth`. Ghost CTA: **See examples** → `/product-visual-library`.
   - Same `bg-[#FAFAF8]`, centered, padding rhythm as the home hero.

2. **The 3-step flow** — reuse existing `HomeHowItWorks` (Upload → Choose → Generate). Already on-brand and content-rich.

3. **Behind each step** (`HowItWorksDeepDive`, new)
   - Three alternating image/text rows that explain what's happening in detail:
     - *Step 1 — Smart product analysis.* AI reads the category, materials, packaging, and brand cues from your photo.
     - *Step 2 — Pick your visual direction.* Choose from 1600+ scenes, 40+ AI models, custom aspect ratios, and brand-locked outfits.
     - *Step 3 — Brand-grade generation.* Multi-model fallback chain, 2K resolution, model + product consistency baked in.
   - Each row uses a soft card with a real preview image from `product_image_scenes` and a small list of 3 bullet points.

4. **What you can create** — reuse `HomeCreateCards`. Already shows product images, video, edits, model training, etc.

5. **Built for every category** — reuse `HomeTransformStrip`. Same swimwear/fragrance/eyewear/jackets/footwear/watches showcase.

6. **Scenes, models, on-brand** — light triple-card block (`HowItWorksTriple`, new) with three short pitches linking to:
   - `/product-visual-library` (1600+ scenes)
   - `/discover` (Explore presets)
   - `/app/brand-models` (Brand models) — shown only if logged in, else links to `/auth`.

7. **FAQ-style "Common questions about the workflow"** — small 4-item accordion focused on workflow questions only (credits per generation, supported file types, brand consistency, commercial use). New small `HowItWorksFAQ` component.

8. **Final CTA** — reuse `HomeFinalCTA`.

### Aesthetic rules followed
- `bg-[#FAFAF8]` page background, `bg-background` (white) section alternating.
- Section padding: `py-16 lg:py-32`.
- Eyebrow micro-label: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`.
- H2: `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight`.
- Card radii: `rounded-3xl`, border `border-[#f0efed]`, shadow `shadow-sm`.
- Buttons: rounded-full pills, primary uses `bg-primary` / `bg-foreground` per existing pattern.
- No em-dashes in copy.

---

## Files touched / created

Created:
- `src/components/ScrollToTop.tsx`
- `src/components/landing/LandingShell.tsx`
- `src/pages/HowItWorks.tsx`
- `src/components/howitworks/HowItWorksHero.tsx`
- `src/components/howitworks/HowItWorksDeepDive.tsx`
- `src/components/howitworks/HowItWorksTriple.tsx`
- `src/components/howitworks/HowItWorksFAQ.tsx`

Edited:
- `src/components/landing/LandingNav.tsx` — `<Link>` + active state + new link list
- `src/App.tsx` — public landing shell route group, ScrollToTop, lazy import for HowItWorks
- `public/sitemap.xml` — add `/how-it-works`
- Page files that currently render their own `<LandingNav />` + `<LandingFooter />` (Home, AIProductPhotography, ProductVisualLibrary, etc.) — remove those direct renders since the shell now provides them. This keeps the nav persistent across SPA route changes (the core fix from §1).