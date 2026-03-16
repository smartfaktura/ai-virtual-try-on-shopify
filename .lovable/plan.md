

## Plan: Create Upscale & Perspectives Feature Pages + Footer Links

### New Files

**1. `src/pages/features/UpscaleFeature.tsx`**
- Follow the same pattern as `VirtualTryOnFeature.tsx` (PageLayout, SEOHead, Hero → Benefits → How It Works → CTA)
- Hero: "Upscale & Enhance Your Product Images" — emphasize going from standard to 2K/4K with AI detail reconstruction
- Benefits cards: Fabric texture recovery, 2K & 4K options, batch upscaling up to 10 images
- How It Works: 3 steps — Select images → Choose resolution (2K/4K) → Get enhanced results
- Mention credit costs: 10 credits for 2K, 15 credits for 4K
- CTA buttons: "Get Started Free" → `/auth`, "Try Upscaling" → `/auth` (registers first, then they land in app)
- Route: `/features/upscale`

**2. `src/pages/features/PerspectivesFeature.tsx`**
- Same layout pattern
- Hero: "Generate Every Angle From a Single Photo" — multi-angle product views (front, back, left, right, close-up, etc.)
- Benefits cards: 8 angle types, scene-aware prompting (detects on-model), matching backgrounds/lighting
- How It Works: Upload source → Select angles → Get cohesive angle set
- Mention 8 credits per angle
- CTA: "Get Started Free" → `/auth`
- Route: `/features/perspectives`

### Modified Files

**3. `src/App.tsx`** — Add two lazy routes:
```
const UpscaleFeature = lazy(() => import('@/pages/features/UpscaleFeature'));
const PerspectivesFeature = lazy(() => import('@/pages/features/PerspectivesFeature'));
```
Add routes under feature pages section:
- `/features/upscale` → `<UpscaleFeature />`
- `/features/perspectives` → `<PerspectivesFeature />`

**4. `src/components/landing/LandingFooter.tsx`** — Add to Product links:
- `{ label: 'Image Upscaling', to: '/features/upscale' }`
- `{ label: 'Perspectives', to: '/features/perspectives' }`

