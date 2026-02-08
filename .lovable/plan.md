
## Improve Website Hero Set — Landscape Banner Carousel Animation

### What Changes

Transform the **Website Hero Set** workflow card from the current portrait (3:4) layout with floating elements into a **landscape hero banner carousel** that showcases 3 different hero banners cycling through. Each banner will demonstrate the "website hero" use case with horizontal compositions featuring negative space for text overlays and CTA buttons — exactly like real website hero sections.

Additionally, regenerate a new AI preview image for the workflow using the edge function.

### Design Concept

The card will use a custom animation component (similar to how `SocialMediaGridThumbnail` is a custom component for the Social Media Pack). Instead of floating product/model chips over a portrait image, it will:

1. Show a **landscape 16:9 hero banner** centered within the portrait card
2. **Cycle through 3 different hero banner compositions** with crossfade transitions
3. Each banner features a **product/model on one side** with **negative space on the other** containing mock text headlines and CTA button elements
4. The "Generated" badge pops in after the carousel cycles

### Visual Layout (per banner frame)

```text
+---------------------------+
|                           |
|  +---------------------+ |
|  |         HERO BANNER  | |
|  | [Product/  | Headline| |
|  |  Model     | Subtext | |
|  |  Image]    | [CTA]   | |
|  +---------------------+ |
|                           |
+---------------------------+
```

Three banner variations:
1. **Fashion** — Model in blazer (left), headline + CTA (right), warm golden tones
2. **Skincare** — Serum product (left), headline + CTA (right), clean minimal aesthetic
3. **Home/Lifestyle** — Candle scene (right), headline + CTA (left), cozy warm tones

### Technical Details

**1. New Component: `src/components/app/HeroBannerThumbnail.tsx`**
- Custom carousel component specifically for the Website Hero Set card
- Uses 3 hero banner images from existing assets as backgrounds
- Each banner has a semi-transparent overlay on one side simulating negative space with mock UI elements (headline text lines, subtext, and a CTA button shape)
- Crossfade animation between the 3 banners on a timed loop
- Ends with a "Generated" sparkle badge like other workflow cards
- Accepts `isActive` prop for hover-triggered animation (consistent with other cards)

**2. Update: `src/components/app/workflowAnimationData.tsx`**
- Remove the `'Website Hero Set'` entry from `workflowScenes` (no longer needed since the card gets its own component)
- Remove the associated asset imports (`heroProduct`, `heroModel`, `heroResult`)

**3. Update: `src/components/app/WorkflowCard.tsx`**
- Add a conditional branch for `workflow.name === 'Website Hero Set'` (similar to the existing `Social Media Pack` branch)
- Render `HeroBannerThumbnail` instead of `WorkflowAnimatedThumbnail` for this workflow

**4. Update: `supabase/functions/generate-workflow-preview/index.ts`**
- Update the `Website Hero Set` prompt to generate a **16:9 landscape** hero banner with explicit negative space instructions
- New prompt will emphasize: wide-format composition, product/model positioned on one side, clean negative space on the opposite side for text overlay, professional website banner aesthetic

**5. Trigger preview regeneration**
- Call the edge function to generate a fresh preview image for the Website Hero Set workflow

### Animation Flow

| Time | What Happens |
|---|---|
| 0.0s | Banner 1 fades in (fashion blazer, model left, text right) |
| 2.5s | Crossfade to Banner 2 (skincare, product left, text right) |
| 5.0s | Crossfade to Banner 3 (home decor, scene right, text left) |
| 7.0s | Shimmer sweep effect |
| 7.5s | "3 Heroes" badge pops in |
| 9.0s | Loop restarts |

### Assets Used (existing, no new uploads needed)

- Banner 1 background: `fashion-blazer-golden.jpg`
- Banner 2 background: `skincare-serum-marble.jpg`
- Banner 3 background: `home-candle-evening.jpg`

### Files Changed

| File | Action |
|---|---|
| `src/components/app/HeroBannerThumbnail.tsx` | **New** — Hero banner carousel component |
| `src/components/app/WorkflowCard.tsx` | **Edit** — Add conditional for Website Hero Set |
| `src/components/app/workflowAnimationData.tsx` | **Edit** — Remove Website Hero Set entry + unused imports |
| `supabase/functions/generate-workflow-preview/index.ts` | **Edit** — Update prompt for landscape hero banner |
