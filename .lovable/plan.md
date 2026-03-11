

## Swap HowItWorks Product Image + 6 Scene Images to Local Assets

### File: `src/components/landing/HowItWorks.tsx`

**1. Replace `cropTopProduct` source** (line 8) from Supabase `hero/hero-product-croptop.jpg` to the local `/images/source-crop-top.jpg` — same image used in the hero section.

**2. Replace the 6 scene images** (lines 10-15) from Supabase hero URLs to local `/images/try-showcase/` paths — same images used on the `/try` page:

```
sceneStudio  → '/images/try-showcase/studio-dark.png'
sceneCoffee  → '/images/try-showcase/cafe-lifestyle.png'
sceneBeach   → '/images/try-showcase/golden-hour.png'
scenePark    → '/images/try-showcase/garden-editorial.png'
sceneRooftop → '/images/try-showcase/urban-edge.png'
sceneUrban   → '/images/try-showcase/pilates-studio.png'
```

**3. Keep `modelThumb` and `envThumb`** (lines 16-17) unchanged since they're used in Step 2 and aren't part of this request.

**4. Switch from `getLandingAssetUrl()` to plain string paths** for the swapped variables, since these are now local public assets.

No other files change.

