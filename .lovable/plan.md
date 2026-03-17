

## Real Estate Interior Photography — Feature Landing Page

### What we're building
A new public feature page at `/features/real-estate-staging` for the **Interior / Exterior Staging** workflow. It will follow the same structure as existing feature pages (Hero → Visual Showcase → Benefits → How It Works → Use Cases → CTA) but be tailored to real estate professionals.

### Visual showcase
We'll use the 4 staging images already in the project as the hero visual — an interactive before/after comparison showing the empty room transforming into Japandi, Eclectic, and Contemporary styles:
- `/images/staging/staging-empty.png` (before)
- `/images/staging/staging-japandi.png`
- `/images/staging/staging-eclectic.png`
- `/images/staging/staging-contemporary.png`

This will be presented as a tabbed gallery where clicking a style name swaps the image with a smooth crossfade — giving visitors an instant feel for the transformation.

### Page structure

1. **Hero Section** — Badge "Real Estate Staging", headline like *"Stage Any Room with AI — In Seconds"*, subline about virtual staging replacing physical staging, CTA button
2. **Interactive Before/After Gallery** — The 4 staging images in a tab-switcher (Empty → Japandi → Eclectic → Contemporary) with crossfade transitions
3. **Benefits Grid** (3 cards) — Cost savings vs physical staging, Multiple styles from one photo, Instant turnaround
4. **How It Works** (3 steps) — Upload empty room photo → Pick a style → Get staged images
5. **Use Cases** (3-4 items) — Listing photos, Airbnb/rental staging, Interior design mockups, Pre-construction marketing
6. **Final CTA** — "Stage Your First Room Free"

### Files to create/modify

| File | Action |
|------|--------|
| `src/pages/features/RealEstateStagingFeature.tsx` | **Create** — New feature page component |
| `src/App.tsx` | **Edit** — Add lazy import + route at `/features/real-estate-staging` |
| `src/components/landing/LandingFooter.tsx` | **Edit** — Add "Real Estate Staging" link to Product column |

### Technical notes
- Follows exact same pattern as `UpscaleFeature.tsx` and `VirtualTryOnFeature.tsx` — uses `PageLayout`, `SEOHead`, `Card`, `Button`
- Uses local staging images from `/images/staging/` (already in `public/`)
- Lazy-loaded in App.tsx like all other feature pages
- No database changes needed

